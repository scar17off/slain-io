const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Update Socket.IO configuration
const io = socketio(server, {
    cors: {
        origin: "*", // Be more permissive in development
        methods: ["GET", "POST"],
        allowedHeaders: ["*"],
        credentials: true
    },
    transports: ['websocket', 'polling'], // Allow both WebSocket and polling
    allowEIO3: true // Enable compatibility mode
});

app.use(cors({
    origin: "*",
    credentials: true
}));

const Area = require('./modules/components/Area');
const Player = require('./modules/components/Player');

app.use(express.static(__dirname + '/frontend/build'));

const mapData = require('./modules/map_data.json');
const areaObjects = [];

// Start from 1 to match the map data keys
for (let i = 1; i <= Object.keys(mapData).length; i++) {
    const area = mapData[i];
    const areaObject = new Area(area);
    areaObject.id = i;
    areaObject.gridSize = 24 + (i * 4) * 24 + (i * 4) * 32;
    areaObject.width = areaObject.height = areaObject.gridSize * 10;
    areaObjects.push(areaObject);
    areaObject.reset();
}

// Update the tick rate
const FPS = 40;
const TICK_RATE = FPS;

// Throttling to the gameState broadcast
let lastBroadcast = 0;
const BROADCAST_INTERVAL = 1000 / FPS;

// Main game loop
setInterval(() => {
    const currentTime = Date.now();
    
    // Update all areas
    areaObjects.forEach(area => {
        area.tick();

        // Only broadcast if enough time has passed
        if (currentTime - lastBroadcast >= BROADCAST_INTERVAL) {
            // Broadcast state to all clients in this area
            const areaState = {
                players: Array.from(area.players.values()).map(player => player.getClientData()),
                enemies: Array.from(area.enemies.values()).map(enemy => enemy.getClientData()),
                pellets: Array.from(area.pellets.values()).map(pellet => pellet.getClientData())
            };

            area.players.forEach(player => {
                player.socket.emit('gameState', areaState);
            });
            
            lastBroadcast = currentTime;
        }
    });
}, 1000 / TICK_RATE);

io.on('connection', (socket) => {
    // Get player name from query parameters
    const playerName = socket.handshake.query.playerName || 'Unnamed';
    
    // Create new player with name from query
    const player = new Player(socket);
    player.name = playerName;

    // Add player to first area
    areaObjects[0].addPlayer(player);

    // Send player their ID
    socket.emit('playerId', player.id);

    // Send area data with proper color
    socket.emit('area', {
        id: 0,
        color: areaObjects[0].color,
        width: areaObjects[0].width,
        height: areaObjects[0].height,
        gridSize: areaObjects[0].gridSize
    });

    console.log('New player joined area:', {
        areaId: 0,
        playerName: playerName,
        dimensions: {
            width: areaObjects[0].width,
            height: areaObjects[0].height,
            gridSize: areaObjects[0].gridSize
        },
        playerPos: {
            x: player.x,
            y: player.y
        }
    });

    socket.on('disconnect', () => {
        areaObjects[0].removePlayer(player);
    });
});

server.listen(3001, '0.0.0.0', () => {
    console.log('Server is running on port 3001');
});