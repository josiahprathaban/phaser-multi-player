import Phaser from 'phaser';

export default class LoadingScene extends Phaser.Scene {
    constructor() {
        super('LoadingScene');
    }

    preload() {
        this.load.image('cardBack', 'assets/card-back.png');
        // Load other assets here
    }

    create() {
        this.scene.start('GameScene');
    }
}
