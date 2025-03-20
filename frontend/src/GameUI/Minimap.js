import React, { useRef, useEffect } from 'react';
import styles from './Minimap.module.css';

const MINIMAP_SIZE = 150;
const PLAYER_DOT_SIZE = 3;
const PELLET_DOT_SIZE = 2;
const VIEW_RADIUS = 500; // Visible radius around player

const Minimap = ({ gameState }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { area, entities, player } = gameState;

        // Clear canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

        if (!area.width || !area.height) return;

        // Get local player
        const localPlayer = entities.players.get(player.id);
        if (!localPlayer) return;

        // Calculate view bounds
        const viewLeft = localPlayer.x - VIEW_RADIUS;
        const viewTop = localPlayer.y - VIEW_RADIUS;
        const viewRight = localPlayer.x + VIEW_RADIUS;
        const viewBottom = localPlayer.y + VIEW_RADIUS;

        // Calculate scale factor for the view area
        const scale = MINIMAP_SIZE / (VIEW_RADIUS * 2);

        // Make minimap circular (this is probably unnecessary)
        ctx.save();
        ctx.beginPath();
        ctx.arc(MINIMAP_SIZE/2, MINIMAP_SIZE/2, MINIMAP_SIZE/2, 0, Math.PI * 2);
        ctx.clip();

        // Draw area border if in view
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.strokeRect(
            (-viewLeft) * scale,
            (-viewTop) * scale,
            area.width * scale,
            area.height * scale
        );

        // Draw pellets within view radius
        entities.pellets.forEach(pellet => {
            if (isInView(pellet.x, pellet.y, viewLeft, viewTop, viewRight, viewBottom)) {
                ctx.fillStyle = `rgb(${pellet.color[0]}, ${pellet.color[1]}, ${pellet.color[2]})`;
                ctx.beginPath();
                ctx.arc(
                    (pellet.x - viewLeft) * scale,
                    (pellet.y - viewTop) * scale,
                    PELLET_DOT_SIZE,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        });

        // Draw enemies within view radius
        entities.enemies.forEach(enemy => {
            if (isInView(enemy.x, enemy.y, viewLeft, viewTop, viewRight, viewBottom)) {
                ctx.fillStyle = 'red';
                ctx.beginPath();
                ctx.arc(
                    (enemy.x - viewLeft) * scale,
                    (enemy.y - viewTop) * scale,
                    PLAYER_DOT_SIZE,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        });

        // Draw other players within view radius
        entities.players.forEach(p => {
            if (p.id !== player.id && isInView(p.x, p.y, viewLeft, viewTop, viewRight, viewBottom)) {
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(
                    (p.x - viewLeft) * scale,
                    (p.y - viewTop) * scale,
                    PLAYER_DOT_SIZE,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        });

        // Draw local player (always in center)
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(
            MINIMAP_SIZE/2,
            MINIMAP_SIZE/2,
            PLAYER_DOT_SIZE,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.restore();
    }, [gameState]);

    // Helper function to check if a point is within view bounds
    const isInView = (x, y, left, top, right, bottom) => {
        return x >= left && x <= right && y >= top && y <= bottom;
    };

    return (
        <canvas 
            ref={canvasRef}
            className={styles.minimap}
            width={MINIMAP_SIZE}
            height={MINIMAP_SIZE}
        />
    );
};

export default Minimap;