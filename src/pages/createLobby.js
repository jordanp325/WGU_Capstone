import '../styles/createLobby.css';
import {useState, useEffect} from 'react'

export default function CreateLobby(){
    // const [details, setDetails] = useState(null);

    useEffect(() => {
        document.title = 'New Lobby - Chess Online';
        // fetch(window.location.protocol + '//' + window.location.host +'/userdetails').then(r => {
        //     if(r.status != 200){
        //         document.cookie = 'sessionToken=;';
        //         window.location.pathname = '/login';
        //     }
        //     else return r.json();
        // }).then(t => {
        //     console.log(t);
        //     setDetails(t);
        // })
    }, []);

    // //sets profile details once retrieved
    // useEffect(() => {
    //     if(details == null) return;
    //     document.getElementById('profileUsername').innerHTML = details.username;
    //     document.getElementById('profileEmail').innerHTML = details.email;
    // }, [details]);

    //redirects to login if not logged in
    if(!Object.fromEntries(document.cookie.split('; ').map(c => c.split('=')))['sessionToken']){
        window.location.pathname = '/login';
    }
    
    function createLobby(){
        let lobbyName = document.getElementById('lobbyName').value;
        let lobbyTime = parseInt(document.getElementById('lobbyTime').value);
        let lobbyBonusTime = parseInt(document.getElementById('lobbyBonusTime').value);

        if(!lobbyName.match(/^[a-zA-Z0-9 ]{3,12}$/)){
            alert('Lobby name must only contain alphanumeric characters, and be between 3 and 12 characters long.');
            return;
        }

        let opts = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lobbyName: lobbyName, time:lobbyTime, bonusTime:lobbyBonusTime })
        };
        fetch(window.location.protocol + '//' + window.location.host +'/createlobby', opts).then(async res => {
            if(res.status == 200){
                window.location.pathname = '/play';
            }
        });
    }

    return (
        <div id='body'>
            <div id='lobbyContainer'>
                <h1>New Lobby</h1>
                <div>
                    <p>Name: </p>
                    <input id='lobbyName'></input>
                </div>
                <div>
                    <p>Time: </p>
                    <select id='lobbyTime' defaultValue={10}>
                        <option value={1}>1 minute</option>
                        <option value={2}>2 minutes</option>
                        <option value={3}>3 minutes</option>
                        <option value={5}>5 minutes</option>
                        <option value={10}>10 minutes</option>
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>60 minutes</option>
                    </select>
                </div>
                <div>
                    <p>Bonus Time: </p>
                    <select id='lobbyBonusTime' defaultValue={0}>
                        <option value={0}>0 seconds</option>
                        <option value={1}>1 second</option>
                        <option value={2}>2 seconds</option>
                        <option value={3}>3 seconds</option>
                        <option value={5}>5 seconds</option>
                        <option value={10}>10 seconds</option>
                        <option value={15}>15 seconds</option>
                        <option value={30}>30 seconds</option>
                        <option value={60}>60 seconds</option>
                    </select>
                </div>
                <button onClick={createLobby}>Create</button>
            </div>
        </div>
    );
}