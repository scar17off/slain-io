const Entity = require("../components/Entity");

class RedSlasher extends Entity {
    constructor() {
        super();
        this.stats.armour.value = 50;
        this.stats.armorPenetration.value = 0;
    }

    tick() {
        
    }

    respawn() {
        
    }
}

module.exports = RedSlasher;