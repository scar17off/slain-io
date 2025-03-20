import React from 'react';
import styles from './Game.module.css';
import Minimap from './Minimap';

const Game = () => {
    return (
        <div className={styles.gameContainer}>
            <canvas id="gameCanvas" className={styles.gameCanvas}></canvas>
            <div className={styles.gameUI}>
                <Minimap />
            </div>
        </div>
    );
};

export default Game; 