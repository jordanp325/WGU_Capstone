import '../styles/lobbyBrowser.css';
import {useState, useEffect} from 'react';

export default function LobbyBrowser(){
    const [lobbies, setLobbies] = useState(null);

    useEffect(() => {
        document.title = 'Browse games - Chess Online';
        getLobbies();
    }, []);

    //redirects to login if not logged in
    if(!Object.fromEntries(document.cookie.split('; ').map(c => c.split('=')))['sessionToken']){
        // //TEMPORARY CODE - TEMPORARY CODE - TEMPORARY CODE
        // if(false)
        // //TEMPORARY CODE - TEMPORARY CODE - TEMPORARY CODE
        window.location.pathname = '/login';
    }

    function getLobbies(search){
        // //TEMPORARY CODE - TEMPORARY CODE - TEMPORARY CODE
        // return;
        // //TEMPORARY CODE - TEMPORARY CODE - TEMPORARY CODE


        let opts = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // body: JSON.stringify({ lobbyName: search })
        };
        fetch(window.location.protocol + '//' + window.location.host + (search ? '/lobbysearch?q='+search : '/lobbies'), opts).then(res => {
            if(res.status == 200){
                return res.json();
            }
            // else{
            //     alert(await res.text());
            // }
        }).then(obj => {
            setLobbies(obj);
        });
    }
    
    let elem = [];

    // //TEMPORARY CODE - TEMPORARY CODE - TEMPORARY CODE
    // if(true){
    // //TEMPORARY CODE - TEMPORARY CODE - TEMPORARY CODE
    if(lobbies && Object.keys(lobbies).length > 0){
        elem.push(
            <div className='row' id='headerContainer'>
                <p className='lobbyName'>Name</p>
                <p className='lobbyTime'>Time</p>
                <p className='lobbyBonusTime'>Bonus Time</p>
                <p className='lobbyFull'>Full?</p>
            </div>
        );
        elem.push(<div className='row' id='divider'></div>);


        // //TEMPORARY CODE - TEMPORARY CODE - TEMPORARY CODE
        // let lobbies = {
        //     'a':{
        //         lobbyName: 'Play ninja',
        //         time: 15,
        //         bonusTime: 3,
        //         full: false,
        //     },
        //     'b':{
        //         lobbyName: 'asesvdsvd\'s chess game',
        //         time: 5,
        //         bonusTime: 0,
        //         full: true,
        //     },
        //     'c':{
        //         lobbyName: 'Play chess with me :(',
        //         time: 60,
        //         bonusTime: 60,
        //         full: false,
        //     },
        // }
        // //TEMPORARY CODE - TEMPORARY CODE - TEMPORARY CODE
        
        for(let i in lobbies){
            elem.push(
                <div className='row lobbyData' onClick={() => {
                    if(!lobbies[i].full)
                        joinLobby(i);
                }}>
                    <p className='lobbyName'>{lobbies[i].lobbyName}</p>
                    <p className='lobbyTime'>{lobbies[i].time + ' minutes'}</p>
                    <p className='lobbyBonusTime'>{lobbies[i].bonusTime + ' seconds'}</p>
                    <p className='lobbyFull'>{lobbies[i].full+''}</p>
                </div>
            );
        }
    }
    else{
        elem.push(
            <div id='noLobbies'><h2>No lobbies found...</h2></div>
        );
    }

    function joinLobby(token){
        let opts = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lobbyToken: token })
        };
        fetch(window.location.protocol + '//' + window.location.host + '/joinlobby', opts).then(async res => {
            if(res.status == 200){
                window.location.pathname = '/play';
            }
            else{
                alert(await res.text());
            }
        });
    }

    function refresh(){
        setLobbies(null);
        getLobbies();
    }
    function search(){
        setLobbies(null);
        getLobbies(document.getElementById('lobbySearch').value);
    }

    return (
        <div id='body'>
            <div id='lobbyContainer'>
                <h1>Browse Lobbies</h1>
                <div className='row' id='buttonContainer'>
                    <button onClick={refresh}>Refresh</button>
                    <input id='lobbySearch'></input>
                    <button onClick={search}>Search</button>
                </div>
                {elem}
                <button id='createLobby' onClick={() => window.location.pathname = '/createlobby'}>Create Lobby</button>
            </div>
        </div>
    );
}