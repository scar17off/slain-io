export default class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.zoom = 1;
    }

    worldToScreen(x, y) {
        return {
            x: (x - this.x) * this.zoom,
            y: (y - this.y) * this.zoom
        };
    }

    screenToWorld(x, y) {
        return {
            x: x / this.zoom + this.x,
            y: y / this.zoom + this.y
        };
    }
} 