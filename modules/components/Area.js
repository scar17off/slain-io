const enemies = require('../enemies/Enemies');
const Pellet = require('./Pellet');

class Area {
    constructor(data) {
        this.id = null;
        this.size = null;
        this.players = [];
        this.enemies = [];
        this.pellets = [];
        this.data = data;
    }

    tick() {
        this.enemies.forEach(enemy => {
            enemy.tick();
        });
    }

    getRandomSpawnPoint(radius) {
        return {
            x: Math.floor(Math.random() * (this.width - radius * 2)) + radius,
            y: Math.floor(Math.random() * (this.height - radius * 2)) + radius
        }
    }

    reset() {
        this.enemies = [];
        this.pellets = [];

        // Spawn enemies
        for (let i = 0; i < this.data.enemies.length; i++) {
            const enemy = new enemies[this.data.enemies[i].type]();
            const spawnPoint = this.getRandomSpawnPoint(enemy.getRadius());
            enemy.x = spawnPoint.x;
            enemy.y = spawnPoint.y;
            this.enemies.push(enemy);
        }

        // Spawn pellets
        const numPellets = 100;
        for (let i = 0; i < numPellets; i++) {
            const pellet = new Pellet();
            const spawnPoint = this.getRandomSpawnPoint(32);
            pellet.x = spawnPoint.x;
            pellet.y = spawnPoint.y;
            this.pellets.push(pellet);
        }
    }

    addPlayer(player) {
        this.players.push(player);
        const spawnPoint = this.getRandomSpawnPoint(player);
        player.x = spawnPoint.x;
        player.y = spawnPoint.y;
    }

    removePlayer(player) {
        this.players = this.players.filter(p => p !== player);
    }
}

module.exports = Area;