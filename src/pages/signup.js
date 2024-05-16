import '../styles/signup.css';
import {useState, useEffect} from 'react'
import ChessAnimation from '../components/chessAnimation';
import raw from '../games.pgn'

export default function Signup(){
    const [pgn, setPgn] = useState('');

    useEffect(() => {
        document.title = 'Sign up - Chess Online';
        fetch(raw).then(f => f.text()).then(t => {
            setPgn(t);
        })
    }, []);

    if(Object.fromEntries(document.cookie.split('; ').map(c => c.split('=')))['sessionToken']){
        window.location.pathname = '/profile';
    }
    
    function signup(){
        let email = document.getElementById('emailInput').value;
        let username = document.getElementById('usernameInput').value;
        let password = document.getElementById('passwordInput').value;

        if(!email.match(/^[a-zA-Z0-9]{3,12}@[a-zA-Z0-9]{3,12}\.com$/))
            alert('Your email is incorrectly formatted');
        else if(!username.match(/^[a-zA-Z0-9]{3,18}$/))
            alert('Your username must be between 3 and 18 characters, and must not include any special characters');
        else if(!password.match(/^[a-zA-Z0-9+\\$`~!@#%^&*]{8,25}$/))
            alert('Your password must be between 8 and 25 characters, and must only include the following special characters: +\\$`~!@#%^&*');
        else{
            let opts = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username, password:password, email:email })
            };
            fetch(window.location.protocol + '//' + window.location.host +'/createuser', opts).then(async res => {
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
                <h1>Create an account</h1>
                <div>
                    <p>Email: </p>
                    <input id='emailInput'/>
                </div>
                <div>
                    <p>Username: </p>
                    <input id='usernameInput'/>
                </div>
                <div>
                    <p>Password: </p>
                    <input type='password' id='passwordInput'/>
                </div>
                <button onClick={signup}>Sign up!</button>
            </div>
        </div>
    );
}