import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import Game from '../components/Game';

const GamePage = () => {
    const phaserGame = useRef(null);

    useEffect(() => {
        if (!phaserGame.current) {
            phaserGame.current = new Phaser.Game({
                type: Phaser.AUTO,
                width: window.innerWidth,
                height: window.innerHeight,
                parent: "game-container",
                scale: {
                    mode: Phaser.Scale.FIT,
                    autoCenter: Phaser.Scale.CENTER_BOTH,
                },
                physics: { default: "arcade" },
                scene: [Game], 
            });
        }

        return () => {
            if (phaserGame.current) {
                phaserGame.current.destroy(true);
                phaserGame.current = null;
            }
        };
    }, []);

    return <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#ffffff',
    }} id="game-container"></div>;
};

export default GamePage;
