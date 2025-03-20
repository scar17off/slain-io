import React, { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import styles from './Game.module.css';
import Minimap from './Minimap';
import Camera from './Camera';
import MapRenderer from './Renderers/MapRenderer';
import ShapeRenderer from './Renderers/ShapeRenderer';
import Controls from './Controls';
import UpgradesMenu from './UpgradesMenu';
import ExperienceBar from './ExperienceBar';

const FPS = 40;
const RENDER_INTERVAL = 1000 / FPS;

const ARMOR_COLOR = [64, 64, 64];
const FIST_COLOR = [64, 64, 64];

const Game = ({ playerName }) => {
    const canvasRef = useRef(null);
    const gameRef = useRef({
        camera: null,
        mapRenderer: null,
        shapeRenderer: null,
        animationFrame: null,
        socket: null,
        controls: null
    });

    // Game state
    const [gameState, setGameState] = useState({
        area: {
            id: null,
            color: '#ffffff',
            gridSize: 100,
            width: 0,
            height: 0
        },
        entities: {
            players: new Map(),
            enemies: new Map(),
            pellets: new Map()
        },
        player: {
            id: null,
            x: 0,
            y: 0,
            angle: 0
        }
    });

    // State management for stats and points
    const [playerStats, setPlayerStats] = useState({
        maxHealth: { value: 100, level: 0, maxLevel: 65536 },
        armor: { value: 0, level: 0, maxLevel: 65536 },
        regeneration: { value: 0.1, level: 0, maxLevel: 65536 },
        blocking: { value: 0.5, level: 0, maxLevel: 65536 },
        attackDamage: { value: 15, level: 0, maxLevel: 65536 },
        armorPenetration: { value: 0, level: 0, maxLevel: 65536 },
        attackSpeed: { value: 13/30, level: 0, maxLevel: 7 },
        criticalChance: { value: 0, level: 0, maxLevel: 20 },
        criticalPower: { value: 200, level: 0, maxLevel: 20 },
        movementSpeed: { value: 0.04, level: 0, maxLevel: 20 },
        energyPool: { value: 100, level: 0, maxLevel: 40 },
        energyRegeneration: { value: 20, level: 0, maxLevel: 32 },
        lifeSteal: { value: 0, level: 0, maxLevel: 65536 },
        damageReflection: { value: 0, level: 0, maxLevel: 65536 },
        transformationHealer: { value: 5, level: 0, maxLevel: 25 }
    });
    const [availablePoints, setAvailablePoints] = useState(0);

    // State for exp
    const [playerExp, setPlayerExp] = useState({
        level: 1,
        experience: 0,
        maxExperience: 100
    });

    // Render function
    const renderGame = useCallback(() => {
        const game = gameRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Update canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Update camera position to follow player
        if (gameState.player.id) {
            const playerEntity = gameState.entities.players.get(gameState.player.id);
            if (playerEntity) {
                // Always center camera on player without clamping like slain.io does (kinda an improvement)
                const halfScreenWorldWidth = (canvas.width / 2) / game.camera.zoom;
                const halfScreenWorldHeight = (canvas.height / 2) / game.camera.zoom;
                
                game.camera.x = playerEntity.x - halfScreenWorldWidth;
                game.camera.y = playerEntity.y - halfScreenWorldHeight;
            }
        }
        
        // Clear canvas with dark color first
        ctx.fillStyle = 'rgb(51, 51, 51)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Save context state
        ctx.save();
        
        // Apply camera transform
        ctx.scale(game.camera.zoom, game.camera.zoom);
        ctx.translate(-game.camera.x, -game.camera.y);

        // 1. First render the map background AND grid
        game.mapRenderer.renderBackground(gameState.area);
        game.mapRenderer.renderGrid(gameState.area);

        // 2. Then render all game entities
        const { players, enemies, pellets } = gameState.entities;
        
        // Helper function to check if point is in view
        const isInView = (x, y, radius = 0) => {
            const left = game.camera.x - radius;
            const right = game.camera.x + canvas.width / game.camera.zoom + radius;
            const top = game.camera.y - radius;
            const bottom = game.camera.y + canvas.height / game.camera.zoom + radius;
            
            return x >= left && x <= right && y >= top && y <= bottom;
        };

        // Render pellets
        pellets.forEach(pellet => {
            if (isInView(pellet.x, pellet.y, pellet.radius)) {
                game.shapeRenderer.circle(
                    pellet.x,
                    pellet.y,
                    pellet.radius,
                    pellet.color,
                    1  // Keep the transparency
                );
            }
        });

        // Render enemies
        enemies.forEach(enemy => {
            if (isInView(enemy.x, enemy.y, enemy.radius)) {
                if (enemy.isCrasher) {
                    // Debug log
                    console.log('Rendering crasher:', {
                        isCrasher: enemy.isCrasher,
                        spikes: enemy.spikes,
                        angle: enemy.angle,
                        radius: enemy.radius
                    });
                    
                    // Render Crasher (saw-like enemy)
                    const spikes = enemy.spikes || 15;
                    const angle = enemy.angle || 0;
                    const outerRadius = enemy.radius; // Make spikes extend beyond body
                    const innerRadius = enemy.radius * 0.75;
                    
                    // Draw spikes first (gray saw blade)
                    for (let i = 0; i < spikes; i++) {
                        const spikeAngle = angle + (i * Math.PI * 2 / spikes);
                        const nextSpikeAngle = angle + ((i + 1) * Math.PI * 2 / spikes);
                        
                        // Draw spike triangle
                        game.shapeRenderer.path(
                            [
                                // Inner point
                                {
                                    x: enemy.x + Math.cos(spikeAngle) * innerRadius,
                                    y: enemy.y + Math.sin(spikeAngle) * innerRadius
                                },
                                // Outer point
                                {
                                    x: enemy.x + Math.cos(spikeAngle + Math.PI/spikes) * outerRadius,
                                    y: enemy.y + Math.sin(spikeAngle + Math.PI/spikes) * outerRadius
                                },
                                // Next inner point
                                {
                                    x: enemy.x + Math.cos(nextSpikeAngle) * innerRadius,
                                    y: enemy.y + Math.sin(nextSpikeAngle) * innerRadius
                                }
                            ],
                            ARMOR_COLOR,  // Gray color for saw blade
                            1.0
                        );
                    }

                    // Then render the inner red body
                    const armorRatio = Math.max(0.2, 1 - (enemy.stats?.armor?.value || 0));
                    game.shapeRenderer.circle(
                        enemy.x,
                        enemy.y,
                        innerRadius * armorRatio,
                        enemy.color || [255, 0, 0],
                        1.0
                    );
                } else if (enemy.isSlasher) {
                    // Render Slasher (original enemy type)
                    // First render armor circle (outer circle)
                    game.shapeRenderer.circle(
                        enemy.x,
                        enemy.y,
                        enemy.radius,
                        ARMOR_COLOR, // Armor color
                        1.0
                    );

                    // Then render main body (inner circle)
                    const armorRatio = Math.max(0.2, 1 - enemy.stats.armor.value);
                    game.shapeRenderer.circle(
                        enemy.x,
                        enemy.y,
                        enemy.radius * armorRatio,
                        enemy.color || [255, 0, 0], // Fallback to red if no color
                        1.0
                    );

                    // Render triangular "fists"
                    const angle = enemy.angle || 0;
                    const triangleSize = enemy.stats.attackDamage.value;
                    const bodyRadius = enemy.radius;

                    // Left triangle
                    game.shapeRenderer.triangle(
                        enemy.x + Math.cos(angle - Math.PI/2) * (bodyRadius + triangleSize),
                        enemy.y + Math.sin(angle - Math.PI/2) * (bodyRadius + triangleSize),
                        triangleSize,
                        angle,
                        ARMOR_COLOR,
                        1.0
                    );

                    // Right triangle
                    game.shapeRenderer.triangle(
                        enemy.x + Math.cos(angle + Math.PI/2) * (bodyRadius + triangleSize),
                        enemy.y + Math.sin(angle + Math.PI/2) * (bodyRadius + triangleSize),
                        triangleSize,
                        angle,
                        ARMOR_COLOR,
                        1.0
                    );
                }
            }
        });

        // Render players
        players.forEach(player => {
            if (isInView(player.x, player.y, player.radius)) {
                // First render armor circle (outer circle)
                game.shapeRenderer.circle(
                    player.x,
                    player.y,
                    player.radius,
                    ARMOR_COLOR, // Armor color
                    1.0
                );

                // Then render main body (inner circle)
                const armorRatio = Math.max(0.2, 1 - player.stats.armor.value); // Minimum 20% of original size
                game.shapeRenderer.circle(
                    player.x,
                    player.y,
                    player.radius * armorRatio,
                    player.color, // Body color
                    1.0
                );

                // Fists
                const fistRadius = player.stats.attackDamage.value; // Scale fists with player size
                const angle = player.angle || 0;
                const bodyRadius = player.radius;

                if (player.blocking) {
                    // When blocking, fists are at 90 degrees to the side but slightly forward
                    const leftAngle = angle - Math.PI/2;  // -90 degrees
                    const rightAngle = angle + Math.PI/2;  // +90 degrees
                    
                    // Fists closer to body when blocking
                    const blockDistance = bodyRadius + fistRadius;
                    const forwardOffset = Math.cos(angle) * (bodyRadius * 0.5); // Move fists forward
                    const sideOffset = Math.sin(angle) * (bodyRadius * 0.5);

                    // Left fist
                    game.shapeRenderer.circle(
                        player.x + Math.cos(leftAngle) * blockDistance + forwardOffset,
                        player.y + Math.sin(leftAngle) * blockDistance + sideOffset,
                        fistRadius,
                        FIST_COLOR,
                        1.0
                    );

                    // Right fist
                    game.shapeRenderer.circle(
                        player.x + Math.cos(rightAngle) * blockDistance + forwardOffset,
                        player.y + Math.sin(rightAngle) * blockDistance + sideOffset,
                        fistRadius,
                        FIST_COLOR,
                        1.0
                    );
                } else {
                    // Normal stance, fists on sides but slightly forward based on angle
                    const sideDistance = bodyRadius + fistRadius;
                    
                    // Calculate side offsets using angle
                    const rightX = Math.cos(angle + Math.PI/2) * sideDistance;
                    const rightY = Math.sin(angle + Math.PI/2) * sideDistance;
                    const leftX = Math.cos(angle - Math.PI/2) * sideDistance;
                    const leftY = Math.sin(angle - Math.PI/2) * sideDistance;
                    
                    // Add forward offset
                    const forwardX = Math.cos(angle) * (bodyRadius * 0.5);
                    const forwardY = Math.sin(angle) * (bodyRadius * 0.5);

                    // Left fist
                    game.shapeRenderer.circle(
                        player.x + leftX + forwardX,
                        player.y + leftY + forwardY,
                        fistRadius,
                        FIST_COLOR,
                        1.0
                    );

                    // Right fist
                    game.shapeRenderer.circle(
                        player.x + rightX + forwardX,
                        player.y + rightY + forwardY,
                        fistRadius,
                        FIST_COLOR,
                        1.0
                    );
                }

                // Draw player name
                if (player.name) {
                    ctx.save();
                    ctx.fillStyle = 'white';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font = '14px Arial';
                    ctx.fillText(player.name, player.x, player.y - player.radius - 10);
                    ctx.restore();
                }
            }
        });

        // Restore context state
        ctx.restore();
    }, [gameState.player.id, gameState.area, gameState.entities]);

    // Separate camera initialization
    useEffect(() => {
        const canvas = canvasRef.current;
        const game = gameRef.current;

        // Initialize camera and renderers
        game.camera = new Camera();
        game.mapRenderer = new MapRenderer(canvas.getContext('2d'));
        game.shapeRenderer = new ShapeRenderer(canvas.getContext('2d'));

        // No cleanup needed for camera
        return () => {
            // No need to destroy camera
        };
    }, []); // Run once on mount

    // Update socket event handlers
    useEffect(() => {
        const game = gameRef.current;

        if (!game.socket) {
            game.socket = io('http://localhost:3001', {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 20000,
                query: {
                    playerName: playerName
                }
            });

            // Initialize controls with camera
            game.controls = new Controls(game.socket, game.camera);

            game.socket.on('area', (areaData) => {
                console.log('Received area data:', areaData);
                
                setGameState(prevState => ({
                    ...prevState,
                    area: {
                        id: areaData.id,
                        color: areaData.color,
                        gridSize: areaData.gridSize,
                        width: areaData.width,
                        height: areaData.height
                    }
                }));

                // Pass new area data to MapRenderer
                game.mapRenderer.setAreaColor(areaData.color);
                game.mapRenderer.gridSize = areaData.gridSize;
            });

            game.socket.on('connect', () => {
                console.log('Connected to server');
            });

            game.socket.on('connect_error', (error) => {
                console.error('Connection error:', error);
            });

            game.socket.on('playerId', (id) => {
                setGameState(prevState => ({
                    ...prevState,
                    player: {
                        ...prevState.player,
                        id: id
                    }
                }));
            });

            // Update controls with player position in gameState handler
            game.socket.on('gameState', (state) => {
                setGameState(prevState => {
                    const players = new Map(state.players.map(p => [p.id, p]));
                    
                    // If we have a local player, update controls with their position
                    if (prevState.player.id) {
                        const localPlayer = players.get(prevState.player.id);
                        if (localPlayer && game.controls) {
                            game.controls.setPlayerPosition(localPlayer.x, localPlayer.y);
                        }
                    }

                    // Convert arrays to Maps and ensure pellet data is complete
                    return {
                        ...prevState,
                        entities: {
                            players,
                            enemies: new Map(state.enemies.map(e => [e.id, e])),
                            pellets: new Map(state.pellets.map(p => [p.id, {
                                id: p.id,
                                x: p.x,
                                y: p.y,
                                radius: p.radius,
                                color: p.color || [255, 255, 255]
                            }]))
                        }
                    };
                });
            });

            // Update stats handler to use server data
            game.socket.on('statsUpdate', (stats) => {
                setPlayerStats(stats);
            });

            // Update points handler
            game.socket.on('pointsUpdate', (points) => {
                setAvailablePoints(points);
            });

            // Update exp handler
            game.socket.on('expUpdate', (expData) => {
                setPlayerExp(expData);
            });
        }

        return () => {
            if (game.controls) {
                game.controls.destroy();
            }
        };
    }, [playerName]);

    // Render loop
    useEffect(() => {
        const game = gameRef.current;
        let lastTime = 0;
        
        const animate = (currentTime) => {
            // Throttle to target FPS
            if (currentTime - lastTime >= RENDER_INTERVAL) {
                renderGame();
                lastTime = currentTime;
            }
            game.animationFrame = requestAnimationFrame(animate);
        };
        
        game.animationFrame = requestAnimationFrame(animate);

        return () => {
            if (game.animationFrame) {
                cancelAnimationFrame(game.animationFrame);
            }
        };
    }, [renderGame]);

    // Cleanup socket on component unmount
    useEffect(() => {
        // Capture the ref value when the effect runs
        const game = gameRef.current;

        return () => {
            if (game?.socket) {
                game.socket.disconnect();
                game.socket = null;
            }
        };
    }, []);

    const handleUpgrade = (statId) => {
        if (availablePoints > 0) {
            gameRef.current.socket?.emit('upgradeStat', statId);
        }
    };

    return (
        <div className={styles.gameContainer}>
            <canvas ref={canvasRef} className={styles.gameCanvas}></canvas>
            <div className={styles.gameUI}>
                <Minimap gameState={gameState} />
                <UpgradesMenu 
                    playerName={playerName}
                    playerStats={playerStats}
                    onUpgrade={handleUpgrade}
                    availablePoints={availablePoints}
                />
                <ExperienceBar 
                    level={playerExp.level}
                    experience={playerExp.experience}
                    maxExperience={playerExp.maxExperience}
                />
            </div>
        </div>
    );
};

export default Game; 