const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const { MongoClient } = require('mongodb');
const dbClient = (process.env.chessport ? 
    new MongoClient('mongodb://chess-server:hyTyQuEMcfd9YZu8VegEXZ1AIdsQKcBGwy1vBS6Exzp6Lgvhv5RxK3z9RrDFwxGFmrnEWM3VHBcxACDb1ZrvFg==@chess-server.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@chess-server@', {family: 4})
    : new MongoClient('mongodb://localhost:27017/', {family: 4}));
const {createHash, randomBytes} = require('crypto');
const cookieParser = require('cookie-parser');
const path = require('path');

const userCache = {}; //used for logins
const publicLobbyCache = {}; //used for lobbies
const privateLobbyCache = {};





const SERVER_HANDLER = async (req, res, next) => {
    //this is where server code goes!
    console.log('Request: '+req.path);

    //#region handling user accounts
    //creating a user account
    if(req.method == 'POST' && req.path == '/createuser'){
        if(
            req.body
            && typeof(req.body) == 'object'
            && typeof(req.body.username) == 'string'
            && typeof(req.body.password) == 'string'
            && typeof(req.body.email) == 'string'
            && req.body.username.match(/^[a-zA-Z0-9]{3,18}$/) //using {} instead of + or * can reduce compute time and stop ReDoS attacks
            && req.body.password.match(/^[a-zA-Z0-9+\\$`~!@#%^&*]{8,25}$/)
            && req.body.email.match(/^[a-zA-Z0-9]{3,12}@[a-zA-Z0-9]{3,12}\.com$/)
            && !req.cookies['sessionToken']
        ){
            let users = dbClient.db('chess').collection('users');
            if(await users.findOne({username:req.body.username}) != null || await users.findOne({email:req.body.email}) != null)
                res.status(409).send('User already exists');
            else{
                const hash = createHash('sha256');
                hash.update(req.body.password);
                dbClient.db('chess').collection('users').insertOne({username:req.body.username, email: req.body.email, passwordHash: hash.digest('base64')});
                dbClient.db('chess').collection('games').insertOne({username:req.body.username, games:[]});
                login(res, req.body.username);
                res.status(200).send('User created');
            }

        }
        else res.status(400).send('Bad request');
    }

    //logging into a user account
    else if(req.method == 'POST' && req.path == '/login'){
        if(
            req.body
            && typeof(req.body) == 'object'
            && typeof(req.body.username) == 'string'
            && typeof(req.body.password) == 'string'
            && req.body.username.match(/^[a-zA-Z0-9]{3,18}$/)
            && req.body.password.match(/^[a-zA-Z0-9+\\$`~!@#%^&*]{8,25}$/)
            && !req.cookies['sessionToken']
        ){
            let user = await dbClient.db('chess').collection('users').findOne({username:req.body.username});
            if(user == null)
                res.status(400).send('Authentication failed');
            else{
                const hash = createHash('sha256');
                hash.update(req.body.password);
                if(user.passwordHash == hash.digest('base64')){
                    login(res, req.body.username);
                    res.status(200).send('Successfully logged in');
                }
                else res.status(400).send('Authentication failed');
            }
        }
        else res.status(400).send('Bad request');
    }

    //logging out of a user account
    else if(req.method == 'POST' && req.path == '/logout'){
        if(
            req.cookies['sessionToken'] 
            && userCache[req.cookies['sessionToken']]
        ){
            delete userCache[req.cookies['sessionToken']];
            res.setHeader('Set-Cookie', 'sessionToken=');
            res.status(200).send('Successfully logged out');
        }
        else res.status(400).send('You are not logged in');
    }

    //get user details of currently logged in user
    else if(req.method == 'GET' && req.path == '/userdetails'){
        if(
            req.cookies['sessionToken'] 
            && userCache[req.cookies['sessionToken']]
        ){
            let details = await dbClient.db('chess').collection('users').findOne({username:userCache[req.cookies['sessionToken']].username});
            //these should NEVER be shared
            delete details.passwordHash;
            delete details._id;
            res.status(200).send(JSON.stringify(details));
        }
        else res.status(400).send('You are not logged in');
    }
    //#endregion

    //#region handling lobbies
    //create lobby
    else if(req.method == 'POST' && req.path == '/createlobby'){
        if(
            req.cookies['sessionToken']
            && userCache[req.cookies['sessionToken']]
            && req.body
            && typeof(req.body.lobbyName) == 'string'
            && req.body.lobbyName.match(/^[a-zA-Z0-9 ]{3,12}$/)
            && typeof(req.body.time) == 'number'
            && typeof(req.body.bonusTime) == 'number'
            && req.body.time >= 1 && req.body.time <= 60
            && req.body.bonusTime >= 0 && req.body.bonusTime <= 60
        ){
            //required fields: lobbyName, time, bonusTime
            let token;
            do{
                token = randomBytes(6).toString('base64');
            } while(publicLobbyCache[token] != undefined);

            publicLobbyCache[token] = {
                lobbyName: req.body.lobbyName,
                time: req.body.time,
                bonusTime: req.body.bonusTime,
                full: false,
            };
            privateLobbyCache[token] = {
                player1Token: req.cookies['sessionToken']
            };

            res.setHeader('Set-Cookie', 'lobbyToken='+token);
            res.status(200).send('Successfully created lobby');
        }
        else res.status(400).send('Bad request');
    }

    //join lobby
    else if(req.method == 'POST' && req.path == '/joinlobby'){
        if(
            req.cookies['sessionToken']
            && userCache[req.cookies['sessionToken']]
            && req.body
            && typeof(req.body.lobbyToken) == 'string'
            && publicLobbyCache[req.body.lobbyToken]
        ){
            if(privateLobbyCache[req.body.lobbyToken].player2Token){
                res.status(409).send('Lobby full');
            }
            else{
                privateLobbyCache[req.body.lobbyToken].player2Token = req.cookies['sessionToken'];
                publicLobbyCache[req.body.lobbyToken].full = true;
                res.setHeader('Set-Cookie', 'lobbyToken='+req.body.lobbyToken);
                res.status(200).send('Successfully joined lobby');
            }
        }
        else res.status(400).send('Bad request');
    }

    //get all lobbies
    else if(req.method == 'GET' && req.path == '/lobbies'){
        if(
            req.cookies['sessionToken']
            && userCache[req.cookies['sessionToken']]
        ){
            res.status(200).send(JSON.stringify(publicLobbyCache));
        }
        else res.status(403).send('You must be logged in');
    }

    //search lobbies
    else if(req.method == 'GET' && req.path == '/lobbysearch'){
        if(
            req.cookies['sessionToken']
            && userCache[req.cookies['sessionToken']]
            && req.query['q']
        ){
            let obj = {};
            for(let i in publicLobbyCache){
                if(publicLobbyCache[i].lobbyName.match(req.query['q'])){
                    obj[i] = publicLobbyCache[i];
                }
            }
            res.status(200).send(JSON.stringify(obj));
        }
        else res.status(400).send('Bad request');
    }

    // //get lobby details
    // else if(req.method == 'GET' && req.path == '/lobbydetails'){
    //     if(
    //         req.cookies['sessionToken']
    //         && userCache[req.cookies['sessionToken']]
    //         && req.cookies['lobbyToken']
    //         && publicLobbyCache[req.cookies['lobbyToken']]
    //     ){
    //         res.status(200).send(JSON.stringify({...publicLobbyCache[req.cookies['lobbyToken']], white: privateLobbyCache[req.cookies['lobbyToken']].player1Token == req.cookies['sessionToken']}));
    //     }
    //     else res.status(400).send('Bad request');
    // }
    //#endregion

    //#region handling game history
    //add game to game history
    else if(req.method == 'POST' && req.path == '/game'){
        if(
            req.cookies['sessionToken']
            && userCache[req.cookies['sessionToken']]
            && req.body
            && typeof(req.body.pgn) == 'string'
            && typeof(req.body.opponent) == 'string'
            && typeof(req.body.wasWhite) == 'boolean'
            && typeof(req.body.time) == 'number'
            && typeof(req.body.bonusTime) == 'number'
            && typeof(req.body.won) == 'boolean'
        ){
            dbClient.db('chess').collection('games').updateOne({username:userCache[req.cookies['sessionToken']].username}, {"$push":{"games":{
                pgn:req.body.pgn,
                opponent: req.body.opponent,
                date: new Date().getTime(), //defacto game id
                wasWhite: req.body.wasWhite,
                time: req.body.time,
                bonusTime: req.body.bonusTime,
                won: req.body.won,
            }}});
            res.status(200).send('Game logged in game history');
        }
        else res.status(400).send('Bad request');
    }

    //retrieve all games from history
    else if(req.method == 'GET' && req.path == '/games'){
        if(
            req.cookies['sessionToken']
            && userCache[req.cookies['sessionToken']]
        ){
            let games = await dbClient.db('chess').collection('games').findOne({username: userCache[req.cookies['sessionToken']].username});
            res.status(200).send(JSON.stringify(games.games));
        }
        else res.status(400).send('Bad request');
    }

    //retrieve specific game from history
    else if(req.method == 'GET' && req.path == '/game'){
        if(
            req.cookies['sessionToken']
            && userCache[req.cookies['sessionToken']]
            && req.query['q']
        ){
            let games = await dbClient.db('chess').collection('games').findOne({username: userCache[req.cookies['sessionToken']].username});
            let game;
            for(let i in games.games){
                if(games.games[i].date == req.query['q']){
                    game = games.games[i];
                }
            }
            if(game) res.status(200).send(JSON.stringify(game));
            else res.status(400).send('Game does not exist');
        }
        else res.status(400).send('Bad request');
    }
    //#endregion




    // all file requests routed to the react public folder
    else if(req.path.match(/(.ico|.js|.css|.jpg|.png|.map|.svg|.pgn|.json)$/)){
        next();
    }

    //react doesn't like rendering paths ending with a '/', even if its a file request
    else if(req.path.match(/(.ico|.js|.css|.jpg|.png|.map|.svg|.pgn|.json)\/$/)){
        res.sendFile(path.join(__dirname, 'build', req.path));
    }

    // always route the remaining requests to the react index file
    else{
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    }
};

//function for logging user in (used when logging in AND creating an account)
function login(res, username){
    let token;
    do{
        token = randomBytes(6).toString('base64');
    } while(userCache[token] != undefined);
    userCache[token] = {
        username: username
    };
    res.setHeader('Set-Cookie', 'sessionToken='+token);
}



//function for handling websockets (used for lobby communications)
const WS_HANDLER = (ws, req) => {
    if(
        req.cookies['sessionToken']
        && userCache[req.cookies['sessionToken']]
        && req.cookies['lobbyToken']
        && publicLobbyCache[req.cookies['lobbyToken']]
    ){
        let sessionToken = req.cookies['sessionToken'];
        let lobbyToken = req.cookies['lobbyToken'];

        if(privateLobbyCache[lobbyToken].player1Token == sessionToken){
            privateLobbyCache[lobbyToken].player1WS = ws;
        }
        else if(privateLobbyCache[lobbyToken].player2Token == sessionToken){
            privateLobbyCache[lobbyToken].player2WS = ws;
        }
        else{
            ws.close();
            return;
        }

        //will close all connections and delete lobby if disconnected from websocket
        ws.on('close', () => {
            if(!publicLobbyCache[lobbyToken])
                return;

            let opponent;
            if(privateLobbyCache[lobbyToken].player1Token == sessionToken)
                opponent = privateLobbyCache[lobbyToken].player2WS;
            else opponent = privateLobbyCache[lobbyToken].player1WS;

            delete publicLobbyCache[lobbyToken];
            delete privateLobbyCache[lobbyToken];

            if(opponent != undefined)
                opponent.close();
        });

        //redirects all messages (except ';') to opponent
        ws.on('message', msg => {
            if(msg.toString() == ';') return; //nontimeout string

            let opponent;
            if(privateLobbyCache[lobbyToken].player1Token == sessionToken)
                opponent = privateLobbyCache[lobbyToken].player2WS;
            else opponent = privateLobbyCache[lobbyToken].player1WS;

            if(opponent != undefined)
                opponent.send('M'+msg); //M is appended to the beginning to denote the message is from the other person and has no server validation
        });

        let opponentWS;
        let opponentToken;
        if(privateLobbyCache[lobbyToken].player1Token == sessionToken){
            opponentWS = privateLobbyCache[lobbyToken].player2WS;
            opponentToken = privateLobbyCache[lobbyToken].player2Token;
        }
        else{
            opponentWS = privateLobbyCache[lobbyToken].player1WS;
            opponentToken = privateLobbyCache[lobbyToken].player1Token;
        }
        if(opponentToken){ //sends details to both players once joined
            console.log('both players connected');
            let msgSelf = {
                ...publicLobbyCache[lobbyToken], 
                white:(privateLobbyCache[lobbyToken].player1Token == sessionToken), 
                opponent: userCache[opponentToken].username, 
                self:userCache[sessionToken].username
            };
            delete msgSelf.full;//unneeded data
            ws.send('S'+JSON.stringify(msgSelf));

            let msgOpponent = {
                ...publicLobbyCache[lobbyToken], 
                white:(privateLobbyCache[lobbyToken].player1Token == opponentToken), 
                self: userCache[opponentToken].username, 
                opponent:userCache[sessionToken].username
            };
            delete msgOpponent.full;//unneeded data
            opponentWS.send('S'+JSON.stringify(msgOpponent));
        }

    }
    else ws.close();
};



//middlware order VERY MUCH MATTERS
app.use(cookieParser()); //cookie parser first, as its used in the WS handler
app.ws('/', WS_HANDLER); //WS next. If put after server handler, it will throw an error
app.use(express.json(), SERVER_HANDLER, express.static('build'));


//start server host and connect to database
const port = process.env.chessport || 8080;
app.listen(port, () => {
    console.log('\nListening on port '+port+'...');
    dbClient.connect().then(() => {
        console.log('Successfully connected to MongoDB...');
    });
});



//list of potential security improvements:
// - add HTTPS to secure against MITM attacks
// - add username to pw hash in order to decrease spillover in any attempts to brute force
// - add email verification process
// - check for duplicate logins
// - switch from p2p to client-server lobby system
// - add further NoSQL injection prevention
// - add move verification for networked moves
// - 
// - 
// - 
// - 
// - 


//list of potential feature improvements:
// - quickplay system with matchmaking
// - lobby subprocess system
// - session expiration (login + lobby)
// - forgot password support
// - store lobbies in a more scalable way
// - possibly switch to using a firewall pinhole instead of websockets, further research needed on this
// - spectating feature to watch other people's games
// - prevent lobby name conflicts
// - add a way to switch colors (black and white)
// - add underpromotion
// - move game history management to server
