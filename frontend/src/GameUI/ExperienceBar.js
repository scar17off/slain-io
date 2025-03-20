import React from 'react';
import styles from './ExperienceBar.module.css';

const ExperienceBar = ({ experience, maxExperience, level }) => {
    const expPercentage = Math.min((experience / maxExperience) * 100, 100);
    
    return (
        <div className={styles.container}>
            <div className={styles.level}>Level {level}</div>
            <div className={styles.expBar}>
                <span 
                    className={styles.expFill} 
                    style={{ width: `${expPercentage}%` }}
                />
            </div>
        </div>
    );
};

export default ExperienceBar; 