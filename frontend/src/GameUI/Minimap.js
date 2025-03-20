import React from 'react';
import styles from './Minimap.module.css';

const Minimap = () => {
    return (
        <div className={styles.minimap}>
            <h2>Minimap</h2>
            <div id="minimap_container">
                {/* Minimap content goes here */}
            </div>
        </div>
    );
};

export default Minimap;