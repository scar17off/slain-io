const Entity = require("./Entity");

class Player extends Entity {
    constructor(socket) {
        super();
        this.socket = socket;
        this.input = {
            up: false,
            down: false,
            left: false,
            right: false
        }
    }

    tick() {
        this.move(this.input);
    }

    move(input) {
        if (input.up) {
            this.y -= this.stats.movementSpeed.value;
        }
        if (input.down) {
            this.y += this.stats.movementSpeed.value;
        }
        if (input.left) {
            this.x -= this.stats.movementSpeed.value;
        }
        if (input.right) {
            this.x += this.stats.movementSpeed.value;
        }
    }
}

module.exports = Player;