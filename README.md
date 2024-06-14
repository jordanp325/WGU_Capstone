# Chess Online

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
This project was previously hosted at https://chessonline.azurewebsites.net/ but can still be ran locally.

## Run Locally
Follow the below steps to run the project locally
1. Install NodeJS
2. Install MongoDB
3. Clone repository to local device
4. Navigate to the folder using the windows command prompt
5. Install all node dependancies using ```npm install```
5. Run the command ```npm run debug```
6. The console should print
```
Listening on port 8080...
Successfully connected to MongoDB...
```
You can then connect to the project using http://localhost:8080/

## Technologies
This project was built using React JS as the frontend framework. All webpages were built and debugged using React JS.
This project uses Express JS as the backend server framework. All web requests are handles by either Express JS or React JS (compiled).
This project accesses a MongoDB Document-based NoSQL database, either local or hosted.
This project was fully deployed and hosted on Azure using the Azure free pricing model before expiring.

## Features
This project includes the following features:
- A custom built chess API which handles board states using PGN notation (found in ChessFunctions.js)
- A user authentication system which stores the user's username and password hash in a database and maintains the session using a sessionKey stored in the browser's cookies
- A websocket system used during chess games to send move data between the server and clients
- Storage of various user details within the database including chess game history which can be later accessed on the website
- Custom http post endpoints used for interaction with the lobby system, user authentication system, game history system, etc. (found in main.js)
