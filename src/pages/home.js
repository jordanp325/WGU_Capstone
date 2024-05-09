import '../styles/home.css';
import ChessAnimation from '../components/chessAnimation';
import {useState, useEffect} from 'react'
// import {defaultChessArray} from '../chessFunctions';
import raw from '../games.pgn'

export default function Home(){
    const [pgn, setPgn] = useState('');

    useEffect(() => {
        document.title = 'Welcome to Chess Online!';
        fetch(raw).then(f => f.text()).then(t => {
            setPgn(t);
        })
    }, []);
    
    return (
        <div id='body'>
            <div className='chessContainer'><ChessAnimation pgn={pgn.split('\n\n')[Math.floor(Math.random() * pgn.split('\n\n').length)]}/></div>
            <div id='logoContainer'>
                <p>Welcome to <br/>Chess Online!</p>
                <button onClick={() => window.location.pathname = (Object.fromEntries(document.cookie.split('; ').map(c => c.split('=')))['sessionToken'] ? '/lobbybrowser' : '/signup')}>Play</button> 
            </div>
        </div>
    );
}