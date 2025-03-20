const Entity = require("../components/Entity");

class RedSlasher extends Entity {
    constructor() {
        super();
        this.color = [220, 0, 0];
        this.isSlasher = true;
    }

    tick(area) {
        // AI behavior will be implemented later
    }

    respawn() {
        // TODO: Implement respawn logic
    }

    getClientData() {
        return {
            ...super.getClientData(),
            isSlasher: true,
            color: this.color
        };
    }
}

module.exports = RedSlasher;