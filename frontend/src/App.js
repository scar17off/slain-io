import React, { useState } from 'react';
import './index.css';
import MainMenu from './MenuContainer/MainMenu';
import Game from './GameUI/Game';

const App = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [playerName, setPlayerName] = useState('');

    const handleStartGame = (nickname) => {
        setPlayerName(nickname);
        setGameStarted(true);
    };

    return (
        <>
            {!gameStarted ? (
                <MainMenu onPlay={handleStartGame} />
            ) : (
                <Game playerName={playerName} />
            )}
        </>
    );
};

export default App;