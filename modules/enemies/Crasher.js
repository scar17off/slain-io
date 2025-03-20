const Entity = require("../components/Entity");

class RedCrasher extends Entity {
    constructor() {
        super();
        this.isCrasher = true;
        this.color = [220, 0, 0];
        this.angle = 0;
        this.spinSpeed = 0.02;
        this.spikes = 15;
    }

    tick(area) {
        this.angle = (this.angle + this.spinSpeed) % (Math.PI * 2);
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