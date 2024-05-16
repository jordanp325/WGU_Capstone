import '../styles/signup.css';
import {useState, useEffect} from 'react'
import ChessAnimation from '../components/chessAnimation';
import raw from '../games.pgn'

export default function Login(){
    const [pgn, setPgn] = useState('');

    useEffect(() => {
        document.title = 'Log in - Chess Online';
        fetch(raw).then(f => f.text()).then(t => {
            setPgn(t);
        })
    }, []);

    if(Object.fromEntries(document.cookie.split('; ').map(c => c.split('=')))['sessionToken']){
        window.location.pathname = '/profile';
    }
    
    function login(){
        let username = document.getElementById('usernameInput').value;
        let password = document.getElementById('passwordInput').value;

        if(!username.match(/^[a-zA-Z0-9]{3,18}$/))
            alert('Your username is incorrectly formatted');
        else if(!password.match(/^[a-zA-Z0-9+\\$`~!@#%^&*]{8,25}$/))
            alert('Your password is incorrectly formatted');
        else{
            let opts = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username, password:password })
            };
            fetch(window.location.protocol + '//' + window.location.host +'/login', opts).then(async res => {
                if(res.status == 200){
                    window.location.pathname = '/profile';
                }
                else{
                    alert(await res.text());
                }
            });
        }
    }

    return (
        <div id='body'>
            <div className='chessContainer'><ChessAnimation pgn={pgn.split('\n\n')[Math.floor(Math.random() * pgn.split('\n\n').length)]}/></div>
            <div id='contentContainer'>
                <h1>Log in to your account</h1>
                <div>
                    <p>Username: </p>
                    <input id='usernameInput'/>
                </div>
                <div>
                    <p>Password: </p>
                    <input type='password' id='passwordInput'/>
                </div>
                <button onClick={login}>Log in</button>
            </div>
        </div>
    );
}