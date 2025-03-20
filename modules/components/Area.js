const enemies = require('../enemies/Enemies');
const Pellet = require('./Pellet');

class Area {
    constructor(data) {
        this.id = null;
        this.size = null;
        this.players = new Map();
        this.enemies = new Map();
        this.pellets = new Map();
        this.data = data;
        this.color = data.color || [221, 194, 246]; // Light purple for 8+ areas
    }

    tick() {
        // Update all entities with area data
        this.enemies.forEach(enemy => {
            enemy.tick(this);
        });

        this.players.forEach(player => {
            player.tick(this);
        });

        this.pellets.forEach(pellet => {
            pellet.tick(this);
        });
    }

    getRandomSpawnPoint(radius) {
        return {
            x: Math.floor(Math.random() * (this.width - radius * 2)) + radius,
            y: Math.floor(Math.random() * (this.height - radius * 2)) + radius
        }
    }

    reset() {
        this.enemies = new Map();
        this.pellets = new Map();

        // Spawn enemies
        for (let i = 0; i < this.data.enemies.length; i++) {
            const enemy = new enemies[this.data.enemies[i].type]();
            const spawnPoint = this.getRandomSpawnPoint(enemy.getRadius());
            enemy.x = spawnPoint.x;
            enemy.y = spawnPoint.y;
            this.enemies.set(enemy.id, enemy);
        }

        // Spawn pellets
        const numPellets = 20;
        for (let i = 0; i < numPellets; i++) {
            const pellet = new Pellet();
            const spawnPoint = this.getRandomSpawnPoint(pellet.radius);
            pellet.x = spawnPoint.x;
            pellet.y = spawnPoint.y;
            this.pellets.set(pellet.id, pellet);
        }
    }

    addPlayer(player) {
        player.area = this;
        // Get random spawn position
        const spawnPoint = this.getRandomSpawnPoint(24);
        player.x = spawnPoint.x;
        player.y = spawnPoint.y;
        this.players.set(player.id, player);
    }

    removePlayer(player) {
        this.players.delete(player.id);
        player.area = null;
    }
}

module.exports = Area;