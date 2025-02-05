import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { Game as MainGameV0 } from './scenes/GameV0';
import { Game as MainGameV1 } from './scenes/GameV1';
import { AUTO, Game, Scale } from 'phaser';
import { Preloader } from './scenes/Preloader';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig

const params = new URLSearchParams(window.location.search);
const version = params.get('version');
let GameTest: Phaser.Types.Scenes.SceneType

switch (version) {
  case "0":
    GameTest = MainGameV0
    break;
  case "1":
    GameTest = MainGameV1
    break;
  default:
    GameTest = MainGame
    break;
}

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  scale: {
    parent: 'game-container',
    mode: Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1080,
    height: 1920,
  },
  parent: 'game-container',
  backgroundColor: '#f9dcb0',
  scene: [
    Boot,
    Preloader,
    GameTest,
  ]
};

const StartGame = new Game(config)
