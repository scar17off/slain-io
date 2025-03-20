export default class Controls {
    constructor(socket, camera) {
        this.socket = socket;
        this.camera = camera;
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        this.angle = 0;
        this.lastSentAngle = null;
        this.playerPosition = { x: 0, y: 0 };
        this.blocking = false;

        // Bind event handlers
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);

        // Add event listeners
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mouseup', this.handleMouseUp);
    }

    setPlayerPosition(x, y) {
        this.playerPosition.x = x;
        this.playerPosition.y = y;
    }

    handleKeyDown(event) {
        if (event.repeat) return; // Ignore key repeat events
        
        const key = event.key.toLowerCase();
        let updated = false;

        if ((key === 'w' || key === 'arrowup') && !this.keys.up) {
            this.keys.up = true;
            updated = true;
        }
        if ((key === 's' || key === 'arrowdown') && !this.keys.down) {
            this.keys.down = true;
            updated = true;
        }
        if ((key === 'a' || key === 'arrowleft') && !this.keys.left) {
            this.keys.left = true;
            updated = true;
        }
        if ((key === 'd' || key === 'arrowright') && !this.keys.right) {
            this.keys.right = true;
            updated = true;
        }

        if (updated) {
            this.sendInputs();
        }
    }

    handleKeyUp(event) {
        const key = event.key.toLowerCase();
        let updated = false;

        if ((key === 'w' || key === 'arrowup') && this.keys.up) {
            this.keys.up = false;
            updated = true;
        }
        if ((key === 's' || key === 'arrowdown') && this.keys.down) {
            this.keys.down = false;
            updated = true;
        }
        if ((key === 'a' || key === 'arrowleft') && this.keys.left) {
            this.keys.left = false;
            updated = true;
        }
        if ((key === 'd' || key === 'arrowright') && this.keys.right) {
            this.keys.right = false;
            updated = true;
        }

        if (updated) {
            this.sendInputs();
        }
    }

    handleMouseMove(event) {
        const mouseWorld = this.camera.screenToWorld(event.clientX, event.clientY);
        
        const newAngle = Math.atan2(
            mouseWorld.y - this.playerPosition.y,
            mouseWorld.x - this.playerPosition.x
        );

        // Only send if angle changed at all
        if (newAngle !== this.angle) {
            this.angle = newAngle;
            this.lastSentAngle = this.angle;
            this.sendAngle();
        }
    }

    handleMouseDown(event) {
        if (event.button === 2) { // Right mouse button
            this.blocking = true;
            this.socket.emit('blocking', true);
        }
    }

    handleMouseUp(event) {
        if (event.button === 2) { // Right mouse button
            this.blocking = false;
            this.socket.emit('blocking', false);
        }
    }

    sendInputs() {
        this.socket.emit('input', this.keys);
    }

    sendAngle() {
        this.socket.emit('angle', this.angle);
    }

    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mousedown', this.handleMouseDown);
        window.removeEventListener('mouseup', this.handleMouseUp);
    }
} 