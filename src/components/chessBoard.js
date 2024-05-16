import "./chessBoard.css";
import {useState, useEffect} from 'react';
import { LegalMoves } from "../chessFunctions";

const piecePaths = {
    K:"./pieces/Chess_klt45.svg",
    Q:"./pieces/Chess_qlt45.svg",
    R:"./pieces/Chess_rlt45.svg",
    B:"./pieces/Chess_blt45.svg",
    N:"./pieces/Chess_nlt45.svg",
    P:"./pieces/Chess_plt45.svg",

    k:"./pieces/Chess_kdt45.svg",
    q:"./pieces/Chess_qdt45.svg",
    r:"./pieces/Chess_rdt45.svg",
    b:"./pieces/Chess_bdt45.svg",
    n:"./pieces/Chess_ndt45.svg",
    p:"./pieces/Chess_pdt45.svg",
};
const movePath = './moveIndicator.png';
const capturePath = './captureIndicator.png';


export default function Chessboard({pieceArray, isBlack, moveCallback, yourTurn, lastMove, canCastle}) {
    const [clickDetails, setClickDetails] = useState(null);
    // //TEMPORARY CODE - TEMPORARY CODE - TEMPORARY CODE
    // const [clickDetails, setClickDetails] = useState({x:1, y:2, moves:[
    //     [false, false, false, false, false, false, false, false], 
    //     [false, false, false, true, false, false, true, false], 
    //     [false, false, false, false, false, false, false, false], 
    //     [false, false, false, false, false, false, false, false], 
    //     [false, false, true, true, false, false, false, false], 
    //     [false, false, false, false, false, false, false, false], 
    //     [false, false, false, false, false, false, false, false], 
    //     [false, false, false, false, false, false, false, false], 
    // ]});
    // //TEMPORARY CODE - TEMPORARY CODE - TEMPORARY CODE


    let board = [];
    for(let x = 0; x < 8; x++){
        let column = [];
        for(let y = 0; y < 8; y++){
            column.push(
                <div className={
                    "chessboard square"
                    + ((x + y) % 2 == 0 ? " dark" : " light")
                    + (lastMove && x == lastMove.x && y == lastMove.y ? ' moved' : '')
                    + (clickDetails && x == clickDetails.x && y == clickDetails.y ? " selected" : '')
                } draggable='false' key={y} onClick={() => handleClick(x, y)}>
                    {pieceArray && pieceArray[x][y] !== '' ? (<img className="chessboard piece" src={piecePaths[pieceArray[x][y]]} alt={pieceArray[x][y]} draggable='false'  />) : ''}
                    {pieceArray && clickDetails && clickDetails.moves[x][y] && pieceArray[x][y] == '' ? (<img className="chessboard move" src={movePath} alt={'move'} draggable='false'/>) : ''}
                    {pieceArray && clickDetails && clickDetails.moves[x][y] && pieceArray[x][y] != '' ? (<img className="chessboard capture" src={capturePath} alt={'capture'} draggable='false'/>) : ''}
                </div>
            );
        }
        board.push(
            <div className={isBlack ? "chessboard column black" : "chessboard column white"} draggable='false' key={x}>
                {column}
            </div>
        );
    }

    function handleClick(x, y){
        if(moveCallback && yourTurn){
            let retry = false;
            console.log(clickDetails);
            if(clickDetails){
                if(clickDetails.moves[x][y])
                    moveCallback(clickDetails.moves[x][y], clickDetails.x, clickDetails.y, x, y);
                else retry = true;
                setClickDetails(null);
            }
            if(clickDetails == null || retry){
                
                console.log(x+' '+y);
                console.log(pieceArray);
                if(pieceArray[x][y] == '' || (isBlack && pieceArray[x][y] == pieceArray[x][y].toUpperCase()) || (!isBlack && pieceArray[x][y] == pieceArray[x][y].toLowerCase()))
                    return;
                console.log('2');
                let moves = LegalMoves(x, y, pieceArray, true, lastMove, canCastle);
                let moveArray = [
                    [false, false, false, false, false, false, false, false], 
                    [false, false, false, false, false, false, false, false], 
                    [false, false, false, false, false, false, false, false], 
                    [false, false, false, false, false, false, false, false], 
                    [false, false, false, false, false, false, false, false], 
                    [false, false, false, false, false, false, false, false], 
                    [false, false, false, false, false, false, false, false], 
                    [false, false, false, false, false, false, false, false], 
                ];
                for(let i in moves)
                    moveArray[moves[i].x][moves[i].y] = moves[i].pgn;
                setClickDetails({
                    moves: moveArray,
                    x:x,
                    y:y,
                });
            }

        }
    }

    

    return(
        // <div className="chessboard background">
            <div className={isBlack ? "chessboard container black" : "chessboard container white"} draggable='false'>
                {board}
            </div>
        // </div>
    );
}