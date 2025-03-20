const Entity = require("../components/Entity");

class RedCrasher extends Entity {
    constructor() {
        super();
        this.isCrasher = true;
        this.color = [220, 0, 0];
        this.stats = {
            maxHealth: { value: 200, level: 0, maxLevel: 1 },
            armor: { value: 0.5, level: 0, maxLevel: 1 }, // 50% armor
            attackDamage: { value: 40, level: 0, maxLevel: 1 },
            movementSpeed: { value: 0.02, level: 0, maxLevel: 1 }
        };
        this.health = this.stats.maxHealth.value;
        this.angle = 0;
        this.spikes = 15;
    }

    tick(area) {
        this.angle = (this.angle + 0.02) % (Math.PI * 2);
    }

    getClientData() {
        const data = super.getClientData();
        return {
            ...data,
            isCrasher: true,
            spikes: this.spikes,
            angle: this.angle,
            color: this.color
        };
    }
}

module.exports = RedCrasher;