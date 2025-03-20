const Entity = require("../components/Entity");

class RedCrasher extends Entity {
    constructor() {
        super();
        this.isCrasher = true;
        this.color = [220, 0, 0];
        this.angle = 0;
        this.spinSpeed = 0.05;
        this.spikes = 15;
    }

    tick(area) {
        this.angle = parseFloat(((this.angle + this.spinSpeed) % (Math.PI * 2)).toFixed(2));
    }

    getRadius() {
        return 36 + this.spikes * 0.5;
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