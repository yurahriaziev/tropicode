import Phaser from 'phaser';
import API_BASE_URL from '../config';

class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
    }

    preload() {
        this.load.image('background', `${API_BASE_URL}/static/bg.jpg`);
        for (let i = 1; i <= 6; i++) {
            this.load.image(`cat${i}`, `${API_BASE_URL}/static/cat${i}.png`);
        }
    }

    create() {
        this.add.image(600, 350, 'background').setScale(2);

        this.cats = this.physics.add.group();
        this.score = 0;
        this.timer = 3;
        this.gameOver = false;

        this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '32px', fill: '#000' });
        this.timerText = this.add.text(800, 10, `Time: ${this.timer}s`, { fontSize: '32px', fill: '#000' });

        this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        this.spawnCat();
    }

    updateTimer() {
        if (this.timer > 0 && !this.gameOver) {
            this.timer--;
            this.timerText.setText(`Time: ${this.timer}s`);
        } else if (!this.gameOver) {
            this.endGame(false);
        }
    }

    spawnCat() {
        if (this.gameOver) return;

        let x = Phaser.Math.Between(100, 900);
        let catKey = `cat${Phaser.Math.Between(1, 6)}`;
        let cat = this.cats.create(x, 0, catKey).setScale(0.8);
        cat.setVelocityY(200);

        cat.setInteractive();
        cat.on('pointerdown', () => {
            if (!this.gameOver) {
                cat.destroy();
                this.score++;
                this.scoreText.setText(`Score: ${this.score}`);

                if (this.score >= 1) {
                    this.endGame(true);
                }
            }
        });

        this.time.addEvent({
            delay: 1000,
            callback: this.spawnCat,
            callbackScope: this
        });
    }

    endGame(won) {
        this.gameOver = true;
        this.cats.clear(true, true); // Remove all falling cats
        this.physics.pause(); // Stop physics

        let resultText = won ? "You Won!" : "Game Over!";
        let color = won ? "#008000" : "#f00"; // Green for win, red for game over

        this.add.text(600, 300, resultText, {
            fontSize: '64px',
            fill: color
        }).setOrigin(0.5);
    }
}

export default Game;
