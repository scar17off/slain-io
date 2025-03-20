const Entity = require("./Entity");

class Player extends Entity {
    constructor(socket) {
        super();
        this.socket = socket;
        this.name = 'Unnamed';
        this.availablePoints = 0;
        this.level = 1;
        this.experience = 0;
        this.maxExperience = 100; // Base XP needed for level 2
        this.input = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        this.angle = 0;
        this.blocking = false;

        // Handle input events
        socket.on('input', (input) => {
            this.input = input;
        });

        socket.on('angle', (angle) => {
            this.angle = angle;
        });

        socket.on('blocking', (blocking) => {
            this.blocking = blocking;
        });

        // Add upgrade handler
        socket.on('upgradeStat', (statId) => {
            if (this.availablePoints > 0 && this.stats[statId]) {
                try {
                    const newValue = this.upgradeStat(statId);
                    this.availablePoints--;
                    
                    // Update health if maxHealth was upgraded
                    if (statId === 'maxHealth') {
                        this.health = newValue;
                    }
                    
                    // Send updated stats and points to client
                    socket.emit('statsUpdate', this.stats);
                    socket.emit('pointsUpdate', this.availablePoints);
                } catch (error) {
                    console.error(`Upgrade failed for ${statId}:`, error.message);
                }
            }
        });

        // Send initial exp data
        socket.emit('expUpdate', {
            level: this.level,
            experience: this.experience,
            maxExperience: this.maxExperience
        });
    }

    tick(area) {
        // Calculate diagonal movement
        let dx = 0;
        let dy = 0;

        if (this.input.up) dy -= 1;
        if (this.input.down) dy += 1;
        if (this.input.left) dx -= 1;
        if (this.input.right) dx += 1;

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }

        // Apply movement speed from stats
        const speed = this.stats.movementSpeed.value * 200;
        const radius = this.getRadius();

        // Calculate new position
        const newX = this.x + dx * speed;
        const newY = this.y + dy * speed;

        // Clamp to area bounds considering player radius
        this.x = Math.max(radius, Math.min(newX, area.width - radius));
        this.y = Math.max(radius, Math.min(newY, area.height - radius));
    }

    addExperience(amount) {
        this.experience += amount;
        
        // Check for level up
        while (this.experience >= this.maxExperience) {
            this.levelUp();
        }

        // Send update to client immediately
        this.socket.emit('expUpdate', {
            level: this.level,
            experience: this.experience,
            maxExperience: this.maxExperience
        });
    }

    levelUp() {
        this.level++;
        this.experience -= this.maxExperience;
        this.maxExperience = Math.floor(this.maxExperience * 1.5); // Increase max experience by 50%
        this.availablePoints += 1; // 1 point per level
        
        // Send updates to client
        this.socket.emit('pointsUpdate', this.availablePoints);
        
        // Heal to full on level up
        this.health = this.stats.maxHealth.value;
    }

    getClientData() {
        return {
            ...super.getClientData(),
            isPlayer: true,
            color: [153, 153, 153],
            level: this.level,
            experience: this.experience,
            maxExperience: this.maxExperience
        };
    }
}

module.exports = Player;