// import Server tool from socket.io package
// analagous to "using System;"
const { Server } = require("socket.io");

// process.env.PORT is the cloud provider giving us an assigned port
// but if there is none, just use port 3000 for local testing
const server_listening_port = process.env.PORT || 3000;

// create the actual server called "io", tell it to listen on port 3000
const io = new Server(server_listening_port, {
    // CORS is a browser security thing, and setting origin to * means
    // we are saying ANY webpage on the internet may talk to this server safely
    cors: { origin: "*"}
});

console.log(`Clicker Server is awake and listening on port ${server_listening_port}`);

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