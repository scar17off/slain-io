const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const Area = require('./modules/components/Area');
const Player = require('./modules/components/Player');

app.use(express.static(__dirname + '/frontend/build'));

const areas = Object.values(require('./modules/map_data.json'));
const areaObjects = [];
for (let i = 0; i < areas.length; i++) {
    const area = areas[i];
    const areaObject = new Area(area);
    areaObject.id = i;
    areaObject.gridSize = 24 + (i * 4) * 24 + (i * 4);
    areaObject.width = areaObject.height = areaObject.gridSize * 100;
    areaObjects.push(areaObject);
    areaObject.reset();
}

io.on('connection', (socket) => {
    const player = new Player(socket);
    areas[0].addPlayer(player);

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(443, () => {
    console.log('Server is running on port 443');
});