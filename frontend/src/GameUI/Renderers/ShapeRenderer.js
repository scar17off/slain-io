export default class ShapeRenderer {
    constructor(ctx) {
        this.ctx = ctx;
    }

    circle(x, y, radius, color, alpha = 1) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
        this.ctx.fill();
    }

    triangle(x, y, size, rotation, color, alpha = 1) {
        this.ctx.beginPath();
        
        // Calculate triangle points
        const angle = Math.PI * 2 / 3;
        for (let i = 0; i < 3; i++) {
            const pointAngle = rotation + (i * angle);
            const pointX = x + Math.cos(pointAngle) * size;
            const pointY = y + Math.sin(pointAngle) * size;
            
            if (i === 0) {
                this.ctx.moveTo(pointX, pointY);
            } else {
                this.ctx.lineTo(pointX, pointY);
            }
        }
        
        this.ctx.closePath();
        this.ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
        this.ctx.fill();
    }

    rectangle(x, y, width, height, color, alpha = 1) {
        this.ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
        this.ctx.fillRect(x, y, width, height);
    }

    text(text, x, y, color, size = 16, align = 'center') {
        this.ctx.font = `${size}px Ubuntu`;
        this.ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
        this.ctx.textAlign = align;
        this.ctx.fillText(text, x, y);
    }
}