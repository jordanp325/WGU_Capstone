import '../styles/viewGame.css';
import {useState, useEffect} from 'react'
import Chessboard from '../components/chessBoard';
import {DefaultChessArray, ProgressBoard} from '../chessFunctions';

export default function ViewGame(){
    const [details, setDetails] = useState(null);
    const [move, setMove] = useState(0);

    useEffect(() => {
        document.title = 'View Game - Chess Online';
        // let opts = {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ username: username, password:password })
        // };
        fetch(window.location.protocol + '//' + window.location.host +'/game'+decodeURI(window.location.search)).then(res => res.json()).then(js => {
            js.pgnArray = js.pgn.substring(1).replaceAll(/[0-9]+\. ?/g, '').replaceAll('\n', ' ').split(' ');
            setDetails(js);
        });

    }, []);

    useEffect(() => {
        document.getElementById('body').focus();
    }, [details]);

    function keydownHandler(event){
        if(!details) return;

        if(event.key == "ArrowLeft"){
            let m = move - 1;
            if(m < 0) m = 0;
            setMove(m);
        }
        else if(event.key == "ArrowRight"){
            let m = move + 1;
            if(m > details.pgnArray.length) m = details.pgnArray.length;
            setMove(m);
        }
    }

    function getBoard(){
        console.log(details);
        let pieceArray = DefaultChessArray();
        for(let i = 0; i < move; i++){
            pieceArray = ProgressBoard(details.pgnArray[i], pieceArray, i % 2 == 1);
        }
        return pieceArray;
    }
    
    return (
        details ? 

        <div id='body' tabIndex={0} onKeyDown={keydownHandler}>
            <p>vs {details.opponent}</p>
            <div className='chessContainer'>
                <Chessboard isBlack={!details.wasWhite} pieceArray={getBoard()}/>
            </div>
            <p>Use left and right arrow keys to progress the board</p>
        </div>

        :<div id='body'><div className='chessContainer'><Chessboard/></div><p>Waiting for data...</p></div>
    );
}