import '../styles/play.css';
import ChessBoard from '../components/chessBoard';
import {useState, useEffect} from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import {DefaultChessArray, LegalMoves, ProgressBoard, InCheck} from '../chessFunctions';
import { flushSync } from 'react-dom';

export default function Play(){
    const { sendMessage, lastMessage, readyState } = useWebSocket('ws://' + window.location.host + '/', {onClose: () => updateGameHistory(true, 'Forfeit', 'Your opponent left the game')});
    const [details, setDetails] = useState(null);
    const [lastMove, setLastMove] = useState({x:-1, y:-1});
    const [pieces, setPieces] = useState(DefaultChessArray());
    const [yourTurn, setYourTurn] = useState(false);
    const [moveData, setMoveData] = useState({move:1, pgn:''});
    const [canCastle, setCanCastle] = useState({0:true, 7:true});

    const [result, setResult] = useState(null);
    const [times, setTimes] = useState(null);
    const [timerRefresh, setTimerRefresh] = useState(false);

    

    

    useEffect(() => {
        if(times && getTimer(times.timingYou) <= 0){
            updateGameHistory(!times.timingYou, 'Timeout', times.timingYou ? 'You ran out of time' : 'Your opponent ran out of time');
        }
        else setTimerRefresh(!timerRefresh);
    }, [timerRefresh]);

    useEffect(() => {
        document.title = 'Waiting for opponent - Chess Online';
        //send dummy data every 30 seconds to keep from disconnecting
        setInterval(() => sendMessage(';'), 30*1000);

        // //TEMPORARY CODE - TEMPORARY CODE - TEMPORARY CODE
        // setDetails({
        //     opponent:'hiraku namakura',
        //     self:'mangus clarsen',
        //     lobbyName:'final event',
        //     time:10,
        //     bonusTime:0,
        //     white:true,
        // });
        // setYourTurn(true);
        // //TEMPORARY CODE - TEMPORARY CODE - TEMPORARY CODE
    }, []);

    useEffect(() => {
        //handle recieving message
        if(lastMessage){
            //server message
            if(lastMessage.data[0] == 'S'){
                let obj = JSON.parse(lastMessage.data.substring(1));
                // console.log(obj)
                document.title = obj.lobbyName+' - Chess Online';
                if(obj.white)
                    setYourTurn(true);
                setDetails(obj);
            }

            //peer message (this includes no move verification)
            else if(lastMessage.data[0] == 'M'){
                let move = JSON.parse(lastMessage.data.substring(1));
                flipTimers();
                
                addToPGN(move.pgn, !details.white);

                setLastMove({x:move.destX,y:move.destY, prevX:move.x, prevY:move.y});
                let newBoard = ProgressBoard(move.pgn, pieces, details.white);
                setPieces(newBoard);
                setYourTurn(true);

                checkResult(details.white, newBoard);
            }
        }
    }, [lastMessage]);

    //redirects to login if not logged in
    if(!Object.fromEntries(document.cookie.split('; ').map(c => c.split('=')))['sessionToken']){
        window.location.pathname = '/login';
    }
    
    //redirects to lobby browser if not in a lobby
    if(!Object.fromEntries(document.cookie.split('; ').map(c => c.split('=')))['lobbyToken']){
        window.location.pathname = '/lobbybrowser';
    }

    function addToPGN(str, white){
        let moveObj = {...moveData};

        moveObj.pgn += ' ' + (white?moveObj.move+'.':'') + str;


        if(!white)
            moveObj.move++;

        setMoveData(moveObj);
    }
    
    function moveCallback(pgn, x, y, destX, destY){
        if(!yourTurn) return;
        //the move has already been verified to be legal

        if(pieces[x][y].toLowerCase() == 'k' || pieces[x][y].toLowerCase() == 'o')
            setCanCastle({0:false,7:false});
        else if(pieces[x][y].toLowerCase() == 'r'){
            let temp = {...canCastle};
            temp[x] = false;
            setCanCastle(temp);
        }
        flipTimers();

        addToPGN(pgn, details.white);

        setLastMove({x:destX,y:destY, prevX:x, prevY:y});
        let newBoard = ProgressBoard(pgn, pieces, !details.white);
        setPieces(newBoard);
        setYourTurn(false);
        sendMessage(JSON.stringify({x: x, y: y, destX:destX, destY:destY, pgn:pgn}));

        checkResult(!details.white, newBoard);
    }

    function checkResult(whiteToMove, pieceArray){
        for(let x = 0; x < 8; x++){
            for(let y = 0; y < 8; y++){
                if(pieceArray[x][y] == '' || (whiteToMove ? pieceArray[x][y] != pieceArray[x][y].toUpperCase() : pieceArray[x][y] != pieceArray[x][y].toLowerCase()))
                    continue;

                let legalMoves = LegalMoves(x, y, pieceArray, true, lastMove, canCastle);
                if(legalMoves.length > 0)
                    return;
            }
        }

        //if the code has reached this point, the player has no legal moves
        if(InCheck(pieceArray, whiteToMove)){
            //checkmate
            if(details.white == whiteToMove)
                updateGameHistory(false, 'Checkmate', 'You cannot save your king');
            else
                updateGameHistory(true, 'Checkmate', 'Your opponent cannot save their king');
        }
        else{
            //stalemate
            updateGameHistory(false, 'Stalemate', 'The opponent has no legal moves')
        }
    }

    function updateGameHistory(won, title, description){
        if(result) return;

        let opts = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                pgn:moveData.pgn,
                opponent: details.opponent,
                wasWhite: details.white,
                time: details.time,
                bonusTime: details.bonusTime,
                won: won,
            })
        };
        fetch(window.location.protocol + '//' + window.location.host + '/game', opts);

        setResult({title: title, description:description});
    }

    function flipTimers(){
        let obj;
        if(times == null){
            obj = {
                timingYou: !details.white,
                selfTimer: details.time * 60 * 1000,
                opponentTimer: details.time * 60 * 1000,
                timingStart: new Date().getTime()
            };
            setTimerRefresh(!timerRefresh);
        }
        else{
            obj = {
                timingYou: !times.timingYou,
                selfTimer: times.selfTimer - (times.timingYou ? new Date().getTime() - (times.timingStart + (1000 * details.bonusTime)): 0),
                opponentTimer: times.opponentTimer - (!times.timingYou ? new Date().getTime() - (times.timingStart + (1000 * details.bonusTime)) : 0),
                timingStart: new Date().getTime()
            };
        }

        setTimes(obj);
    }
    function timerToString(time){
        let centiseconds = Math.floor(time / 10) % 100;
        let seconds = Math.floor(time / 1000) % 60;
        let minutes = Math.floor(time / (1000 * 60));

        return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds + '.' + (centiseconds < 10 ? '0' : '') + centiseconds;
    }
    function getTimer(self){
        if(!times)
            return details.time * 1000 * 60;

        let time = self ? times.selfTimer : times.opponentTimer;
        if(times.timingYou == self)
            time -= (new Date().getTime() - times.timingStart);

        if(time < 0)
            return 0;
        return time;
    }

    function playerRowClass(isTurn, self){
        let turn = '';
        if(isTurn){
            turn = ' turn';
            let timer = getTimer(self);
            //timer is red if left with 10 seconds or less
            if(timer < (1000 * 10))
                turn = ' turnred';
            //timer is yellow if left with 1 minute or less
            else if(timer < (1000 * 60))
                turn = ' turnyellow';
        }
        return 'playerRow' + turn;
    }
    
    return (details ? 
        <div id='body'>
            <div className={playerRowClass(!yourTurn, false)}>
                <p className='chessTimer'>{timerToString(getTimer(false))}</p>
                <p className='playerName'>{details.opponent}</p>
            </div>
            <div className='chessContainer'>
                <ChessBoard isBlack={(!details.white)} pieceArray={pieces} moveCallback={result ? null : moveCallback} yourTurn={yourTurn} lastMove={lastMove} canCastle={canCastle}/>
            </div>
            <div className={playerRowClass(yourTurn, true)}>
                <p className='chessTimer'>{timerToString(getTimer(true))}</p>
                <p className='playerName'>{details.self}</p>
            </div>{result ?
                <div id='waitingContainer'><div>
                    <h1>{result.title}</h1>
                    <p>{result.description}</p>
                </div></div>
            :null}
        </div> : 
        <div id='body'>
            <div className='chessContainer'><ChessBoard/></div>
            <div id='waitingContainer'>
                <p>Waiting for opponent...</p>
            </div>
        </div>
    );
}