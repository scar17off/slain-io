const Entity = require("../components/Entity");

class RedSlasher extends Entity {
    constructor() {
        super();
        this.color = [220, 0, 0];
        this.stats = {
            maxHealth: { value: 100, level: 0, maxLevel: 1 },
            armor: { value: 0.3, level: 0, maxLevel: 1 }, // 30% armor
            attackDamage: { value: 25, level: 0, maxLevel: 1 },
            movementSpeed: { value: 0.03, level: 0, maxLevel: 1 }
        };
        this.health = this.stats.maxHealth.value;
    }

    tick(area) {
        // AI behavior will be implemented later
    }

    getClientData() {
        return {
            ...super.getClientData(),
            isSlasher: true,
            color: this.color
        };
    }

    respawn() {
        // TODO: Implement respawn logic
    }
}

module.exports = RedSlasher;