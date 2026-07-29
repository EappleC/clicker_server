const http = require("http");
const WebSocket = require("ws");

const server_listening_port = process.env.PORT || 3000;

// "Yes Man" HTTP server, mainly so Render's health check gets a 200 OK.
const httpServer = http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Server is healthy and running!");
});

// Attach a plain WebSocket server to the same HTTP server.
const wss = new WebSocket.Server({ server: httpServer });

httpServer.listen(server_listening_port, () => {
    console.log(`Clicker Server is awake and listening on port ${server_listening_port}`);
});

let masterNumber = 1000000;

function broadcastNumber() {
    const payload = JSON.stringify({ type: "update", number: masterNumber });
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
}

wss.on("connection", (ws) => {
    console.log("Player connected");

    // Send the current number immediately to the new player.
    ws.send(JSON.stringify({ type: "update", number: masterNumber }));

    ws.on("message", (raw) => {
        let data;
        try {
            data = JSON.parse(raw);
        } catch (err) {
            console.warn("Received malformed message:", raw);
            return;
        }

        if (data.type === "click") {
            masterNumber--;
            console.log("Someone clicked and now the number is", masterNumber);
            broadcastNumber();
        }
    });

    ws.on("close", () => {
        console.log("Player left");
    });

    ws.on("error", (err) => {
        console.warn("Socket error:", err.message);
    });
});