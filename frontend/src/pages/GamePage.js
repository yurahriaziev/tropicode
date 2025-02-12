import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import Game from '../components/Game'; // Ensure this is the correct path

const GamePage = () => {
    const phaserGame = useRef(null);

    useEffect(() => {
        if (!phaserGame.current) {
            phaserGame.current = new Phaser.Game({
                type: Phaser.AUTO,
                width: window.innerWidth,
                height: window.innerHeight,
                parent: "game-container", // Attach to a div
                scale: {
                    mode: Phaser.Scale.FIT,
                    autoCenter: Phaser.Scale.CENTER_BOTH,
                },
                physics: { default: "arcade" },
                scene: [Game], // Ensure the scene is included
            });
        }

        return () => {
            if (phaserGame.current) {
                phaserGame.current.destroy(true);
                phaserGame.current = null;
            }
        };
    }, []);

    return <div id="game-container"></div>;
};

export default GamePage;
