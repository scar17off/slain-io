const enemies = require('../enemies/Enemies');

class Area {
    constructor(data) {
        this.id = null;
        this.size = null;
        this.players = [];
        this.enemies = [];
        this.data = data;
    }

    tick() {
        this.enemies.forEach(enemy => {
            enemy.tick();
        });
    }

    getRandomSpawnPoint(entity) {
        return {
            x: Math.floor(Math.random() * (this.width - entity.radius * 2)) + entity.radius,
            y: Math.floor(Math.random() * (this.height - entity.radius * 2)) + entity.radius
        }
    }

    reset() {
        this.enemies = [];

        // Spawn enemies
        for (let i = 0; i < this.data.enemies.length; i++) {
            const enemy = new enemies[this.data.enemies[i].type]();
            const spawnPoint = this.getRandomSpawnPoint(enemy);
            enemy.x = spawnPoint.x;
            enemy.y = spawnPoint.y;
            this.enemies.push(enemy);
        }
    }

    addPlayer(player) {
        this.players.push(player);
    }

    removePlayer(player) {
        this.players = this.players.filter(p => p !== player);
    }
}

module.exports = Area;