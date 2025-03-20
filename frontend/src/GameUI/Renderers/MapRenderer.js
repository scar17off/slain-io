class MapRenderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.gridSize = 100;
        this.areaColor = [255, 255, 255];
    }

    setAreaColor(color) {
        this.areaColor = color;
    }

    renderBackground(area) {
        // Safety check (it doesn't work if this is not set)
        if (!this.areaColor || !Array.isArray(this.areaColor)) {
            this.areaColor = [255, 255, 255];
        }
        
        this.ctx.fillStyle = `rgb(${this.areaColor[0]}, ${this.areaColor[1]}, ${this.areaColor[2]})`;
        this.ctx.fillRect(0, 0, area.width, area.height);
    }

    renderGrid(area) {
        // Darker version of the area color for the grid with transparency
        const gridColor = `rgba(${this.areaColor[0] * 0.5}, ${this.areaColor[1] * 0.5}, ${this.areaColor[2] * 0.5}, 0.2)`;
        
        // Render the grid lines
        this.ctx.strokeStyle = gridColor;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();

        // Draw vertical lines
        for (let x = 0; x <= area.width; x += this.gridSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, area.height);
        }

        // Draw horizontal lines
        for (let y = 0; y <= area.height; y += this.gridSize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(area.width, y);
        }

        this.ctx.stroke();

        // Draw border with slightly higher opacity
        this.ctx.strokeStyle = `rgba(${this.areaColor[0] * 0.5}, ${this.areaColor[1] * 0.5}, ${this.areaColor[2] * 0.5}, 0.4)`;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 0, area.width, area.height);
    }

    render(camera, area) {
        this.renderBackground(camera, area);
        this.renderGrid(camera, area);
    }
}

export default MapRenderer;