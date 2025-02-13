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
        this.load.image('giftButton', `${API_BASE_URL}/static/giftButton.png`)
    }

    create() {
        this.add.image(800, 550, 'background').setScale(3);

        this.cats = this.physics.add.group();
        this.score = 0;
        this.timer = 10;
        this.gameOver = false;

        this.scoreText = this.add.text(30, 50, 'Score: 0', { fontSize: '64px', fill: '#000' });
        this.timerText = this.add.text(1370, 50, `Time: ${this.timer}s`, { fontSize: '64px', fill: '#000' });

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

                if (this.score >= 10) {
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
        this.cats.clear(true, true)
        this.physics.pause()

        let resultText = won ? "You Won!" : "Game Over!"
        let color = won ? "#008000" : "#f00"

        this.add.text(850, 450, resultText, {
            fontSize: '64px',
            fill: color
        }).setOrigin(0.5);

        if (won) {
            this.createGiftButton()
        } else {
            this.time.delayedCall(3000, () => {
                window.location.reload()
            });
        }
    }

    createGiftButton() {
        let button = this.add.image(850, 550, 'giftButton').setScale(0.5).setInteractive();

        button.on('pointerdown', () => {
            this.showGiftMessage()
        });
    }

    showGiftMessage() {
        this.cameras.main.setBackgroundColor(0xFDC2FF);
    
        this.cats.clear(true, true); 
        this.children.removeAll();
    
        this.add.text(850, 450, "Will you be my Valentine?", {
            fontSize: '64px',
            fill: '#D50000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        let buttonGraphics = this.add.graphics();
        let buttonWidth = 150;
        let buttonHeight = 60;
        let cornerRadius = 20;

        buttonGraphics.fillStyle(0xFF4081, 1)
        buttonGraphics.fillRoundedRect(655, 500, buttonWidth, buttonHeight, cornerRadius);

        let yesButton1 = this.add.text(730, 530, "Yes", {
            fontSize: '36px',
            fill: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        buttonGraphics.fillStyle(0xFF4081, 1);
        buttonGraphics.fillRoundedRect(905, 500, buttonWidth, buttonHeight, cornerRadius);

        let yesButton2 = this.add.text(980, 530, "Yes", {
            fontSize: '36px',
            fill: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
        yesButton1.on('pointerdown', () => this.showLoveMessage());
        yesButton2.on('pointerdown', () => this.showLoveMessage());
    }

    showLoveMessage() {
        this.children.removeAll();
        this.add.text(850, 460, "Good:)", {
            fontSize: '50px',
            fill: '#D50000'
        }).setOrigin(0.5);
        this.add.text(850, 550, "I'll see you tomorrow night at Moshi Moshi @ 7:45PM", {
            fontSize: '50px',
            fill: '#D50000'
        }).setOrigin(0.5);
    }
}

export default Game;
