import Chessboard from './chessBoard';
import {useState, useEffect} from 'react'
import {DefaultChessArray, ProgressBoard} from '../chessFunctions'



export default function ChessAnimation({pgn}){
    const [move, setMove] = useState(0);
    const [board, setBoard] = useState(DefaultChessArray());
    // let pieceArray = DefaultChessArray();

    useEffect(() => {
        setTimeout(() => {
            setTimeout(() => setMove(move + 1), 1000);
        }, Math.floor(Math.random() * 1000));
    }, []);

    useEffect(() => {
        if(pgn){
            let pieceArray = DefaultChessArray();
            let moves;
            if(pgn.match(/^1\./)) moves = pgn.replaceAll(/[0-9]+\. ?/g, '').replaceAll('\n', ' ').split(' ');
            else moves = pgn.split(/\n1\. ?/)[1].replaceAll(/[0-9]+\. ?/g, '').replaceAll('\n', ' ').split(' ');
            for(let i = 0; i < move && i < moves.length-1; i++){
                pieceArray = ProgressBoard(moves[i], pieceArray, i % 2 === 1);
            }
            setBoard(pieceArray);
        }
        setTimeout(() => setMove(move + 1), 1000);
    }, [move])


    return(
        <Chessboard pieceArray={board}/>
    );
}

