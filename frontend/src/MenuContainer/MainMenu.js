import React, { useState } from 'react';
import styles from './MainMenu.module.css';

const MainMenu = ({ onPlay }) => {
    const [nickname, setNickname] = useState('');

    const handlePlay = () => {
        if (!nickname.trim()) return;
        onPlay(nickname);
    };

    return (
        <div className={styles.mainMenu}>
            <div className={styles.menuContainer}>
                <h1 className={styles.title}>Slain.io</h1>
                
                <input
                    type="text"
                    className={styles.nicknameInput}
                    placeholder="Enter nickname"
                    maxLength={20}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                />

                <button 
                    className={styles.playButton}
                    onClick={handlePlay}
                >
                    SLAY!
                </button>

                <div className={styles.controlsSection}>
                    <h2>Controls</h2>
                    <div className={styles.controlsGrid}>
                        <div className={styles.controlItem}>
                            <div className={styles.key}>
                                <span className={styles.keystroke}>W</span>
                                <span className={styles.keystroke}>A</span>
                                <span className={styles.keystroke}>S</span>
                                <span className={styles.keystroke}>D</span>
                            </div>
                            <span className={styles.action}>Move</span>
                        </div>
                        <div className={styles.controlItem}>
                            <div className={styles.key}>
                                <span className={styles.keystroke}>LMB</span>
                            </div>
                            <span className={styles.action}>Attack</span>
                        </div>
                        <div className={styles.controlItem}>
                            <div className={styles.key}>
                                <span className={styles.keystroke}>RMB</span>
                                <span className={styles.or}>or</span>
                                <span className={styles.keystroke}>X</span>
                            </div>
                            <span className={styles.action}>Block</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainMenu;