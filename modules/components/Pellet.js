class Pellet {
    static COLORS = [
        [135, 160, 36],
        [13, 104, 32],
        [14, 106, 59], 
        [217, 139, 85],
        [0, 64, 92],
        [215, 85, 181],
        [1, 80, 135],
        [138, 86, 217],
        [101, 81, 204],
        [133, 92, 63],
        [162, 98, 1],
        [183, 12, 38],
        [62, 43, 106],
        [36, 163, 23]
    ];

    constructor() {
        this.id = Math.random().toString(36).substr(2, 9);
        this.x = 0;
        this.y = 0;
        this.radius = 12;
        this.color = this.getRandomColor();
        this.experience = 5;
    }

    getRandomColor() {
        return Pellet.COLORS[Math.floor(Math.random() * Pellet.COLORS.length)];
    }

    tick(area) {
        const players = area.players;

        players.forEach(player => {
            const dx = this.x - player.x;
            const dy = this.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.radius + player.getRadius()) {
                // Give experience to player
                player.addExperience(this.experience);
                
                // Get new spawn position and color
                const spawnPoint = area.getRandomSpawnPoint(this.radius);
                this.x = spawnPoint.x;
                this.y = spawnPoint.y;
                this.color = this.getRandomColor();
            }
        });
    }

    getClientData() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            radius: this.radius,
            color: this.color
        };
    }
}

module.exports = Pellet;