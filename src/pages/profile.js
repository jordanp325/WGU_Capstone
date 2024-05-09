import '../styles/profile.css';
import {useState, useEffect} from 'react'

export default function Profile(){
    const [details, setDetails] = useState(null);

    useEffect(() => {
        document.title = 'Profile details - Chess Online';
        fetch(window.location.protocol + '//' + window.location.host +'/userdetails').then(r => {
            if(r.status != 200){
                document.cookie = 'sessionToken=;';
                window.location.pathname = '/login';
            }
            else return r.json();
        }).then(t => {
            console.log(t);
            setDetails(t);
        })
    }, []);

    //sets profile details once retrieved
    useEffect(() => {
        if(details == null) return;
        document.getElementById('profileUsername').innerHTML = details.username;
        document.getElementById('profileEmail').innerHTML = details.email;
    }, [details]);

    //redirects to login if not logged in
    if(!Object.fromEntries(document.cookie.split('; ').map(c => c.split('=')))['sessionToken']){
        window.location.pathname = '/login';
    }
    
    function logout(){
        let opts = {
            method: 'POST',
            // headers: { 'Content-Type': 'application/json' },
            // body: JSON.stringify({ username: username, password:password })
        };
        fetch(window.location.protocol + '//' + window.location.host +'/logout', opts).then(async res => {
            if(res.status == 200){
                window.location.pathname = '/';
            }
            else{
                alert(await res.text());
            }
        });
    }

    return (
        <div id='body'>
            <div id='profileContainer'>
                <h1>Account details</h1>
                <div>
                    <p>Username: </p>
                    <p className='profileDatafield' id='profileUsername'></p>
                </div>
                <div>
                    <p>Email: </p>
                    <p className='profileDatafield' id='profileEmail'></p>
                </div>
                <button onClick={logout}>Log out</button>
            </div>
        </div>
    );
}