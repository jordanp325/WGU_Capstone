import '../styles/historyBrowser.css';
import {useState, useEffect} from 'react';

export default function HistoryBrowser(){
    const [history, setHistory] = useState(null);

    useEffect(() => {
        document.title = 'Game history - Chess Online';
        getHistory();
    }, []);

    //redirects to login if not logged in
    if(!Object.fromEntries(document.cookie.split('; ').map(c => c.split('=')))['sessionToken']){
        // //TEMPORARY CODE - TEMPORARY CODE - TEMPORARY CODE
        // if(false)
        // //TEMPORARY CODE - TEMPORARY CODE - TEMPORARY CODE
        window.location.pathname = '/login';
    }

    function getHistory(){
        // //TEMPORARY CODE - TEMPORARY CODE - TEMPORARY CODE
        // return;
        // //TEMPORARY CODE - TEMPORARY CODE - TEMPORARY CODE

        fetch(window.location.protocol + '//' + window.location.host + '/games').then(res => res.json()).then(obj => {
            setHistory(obj);
        });
    }
    
    let elem = [];

    // //TEMPORARY CODE - TEMPORARY CODE - TEMPORARY CODE
    // if(true){
    // //TEMPORARY CODE - TEMPORARY CODE - TEMPORARY CODE
    if(history && Object.keys(history).length > 0){
        elem.push(
            <div className='row' id='headerContainer'>
                <p className='gameDate'>Date</p>
                <p className='gameOpponent'>Opponent</p>
                <p className='gameTime'>Time</p>
                <p className='gameBonusTime'>Bonus Time</p>
                <p className='gameWon'>Won?</p>
            </div>
        );
        elem.push(<div className='row' id='divider'></div>);


        // //TEMPORARY CODE - TEMPORARY CODE - TEMPORARY CODE
        // let history = {
        //     'a':{
        //         opponent: res.body.opponent,
        //         date: new Date().getTime(),
        //         time: res.body.time,
        //         bonusTime: res.body.bonusTime,
        //         won: res.body.won,
        //     },
        // }
        // //TEMPORARY CODE - TEMPORARY CODE - TEMPORARY CODE
        
        for(let i in history){
            elem.push(
                <div className='row gameData' onClick={() => {
                    window.location.href = window.location.protocol + '//' + window.location.host + '/viewgame?q='+history[i].date
                }}>
                    <p className='gameDate'>{new Date(history[i].date).toDateString()}</p>
                    <p className='gameOpponent'>{history[i].opponent}</p>
                    <p className='gameTime'>{history[i].time+' minutes'}</p>
                    <p className='gameBonusTime'>{history[i].bonusTime+' seconds'}</p>
                    <p className='gameWon'>{history[i].won+''}</p>
                </div>
            );
        }
    }
    else{
        elem.push(
            <div id='noHistory'><h2>No game history</h2></div>
        );
    }

    return (
        <div id='body'>
            <div id='historyContainer'>
                <h1>Game History</h1>
                {elem}
            </div>
        </div>
    );
}