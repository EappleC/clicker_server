// 1. Import Node's built-in HTTP module alongside Socket.IO
const http = require("http");
const { Server } = require("socket.io");

const server_listening_port = process.env.PORT || 3000;

// 2. Create a standard "Yes Man" HTTP server. 
// Whenever Render's health check pings it, it instantly replies "200 OK".
const httpServer = http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Server is healthy and running!");
});

// 3. Attach our Socket.IO server TO the HTTP server
const io = new Server(httpServer, {
    cors: { origin: "*"}
});

// 4. Make the HTTP server listen, instead of Socket.IO directly
httpServer.listen(server_listening_port, () => {
    console.log(`Clicker Server is awake and listening on port ${server_listening_port}`);
});

let masterNumber = 1000000;

// on player connection to the server, create a "socket" object
// the socket is a private line to that specific player
io.on("connection", (socket) => {

    // every player gets random unique id when they connect
    console.log("Player connected with ID: ", socket.id);

    // socket.emit sends a real-time message named "updateNumber" along with the data "masterNumber" across the socket connection
    // this is basically for us to send them the current number so their screen is up to date ASAP
    socket.emit("updateNumber", masterNumber);

    // and now we wanna listen to THIS SPECIFIC PLAYER to say the word "click"
    socket.on("click", () => {
        masterNumber--;
        console.log("Someone clicked and now the number is ", masterNumber);

        // io.emit talks to EVERYONE that's currently connected
        // IMMEDIATELY shouts the newly subtracted master number to all players simultaneously
        io.emit("updateNumber", masterNumber);
    });

    // listen for when the player closes the browser tab and then print out their id
    socket.on("disconnect", () => {
        console.log("Player left with ID: ", socket.id);
    })
});