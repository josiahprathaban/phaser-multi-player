import { GameObjects, Scene } from 'phaser';
import questions from '../questions.json';
import socket from "../socket";

export class Game extends Scene {
  background: GameObjects.Image | undefined;
  imgPlayer1: GameObjects.Image | undefined;
  imgPlayer2: GameObjects.Image | undefined;
  imgMaskPlayer1: GameObjects.Image | undefined;
  imgMaskPlayer2: GameObjects.Image | undefined;
  sptDustPlayer1: GameObjects.Sprite | undefined;
  sptDustPlayer2: GameObjects.Sprite | undefined;
  gameCamera: Phaser.Cameras.Scene2D.Camera | undefined;
  optionButtons: GameObjects.Container[] = [];
  questionBubble: GameObjects.Container | undefined;
  currentQuestion: number = 0
  playersTween: Phaser.Tweens.Tween | undefined
  player: String = '';
  enterBtn: GameObjects.Text;

  constructor() {
    super('Game');
  }

  async create() {
    socket.emit("handShake");

    // animations
    this.anims.create({
      key: "animDust",
      frames: this.anims.generateFrameNumbers("sptDust", {
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      }),
      frameRate: 10,
    });
    this.anims.create({
      key: "animDust2",
      frames: this.anims.generateFrameNumbers("sptDust", {
        frames: [6, 7, 8, 9],
      }),
      frameRate: 5,
    });


    this.background = this.add.image(0, 0, 'background').setOrigin(0.32, 0).setScale(0.9)

    this.imgPlayer1 = this.add.image(200, 1100, 'imgPlayer1').setDepth(100).setScale(1.5).setFlipX(true).setAlpha(0);
    this.sptDustPlayer1 = this.add
      .sprite(0, 0, "sptDust")
      .setOrigin(0)
      .setDepth(2000).setScale(2).setFlipX(true).setFrame(9);

    this.imgPlayer2 = this.add.image(Number(this.game.config.width) - 200, 1100, 'imgPlayer2').setDepth(99).setScale(1.5).setAlpha(0);
    this.sptDustPlayer2 = this.add
      .sprite(0, 0, "sptDust")
      .setOrigin(0)
      .setDepth(2000).setScale(2).setFrame(9);

    this.playersTween = this.tweens.add({
      targets: [this.imgPlayer1, this.imgPlayer2],
      scaleX: 1.45,
      scaleY: 1.55,
      y: 1095,
      duration: 1000,
      ease: 'Linear',
      repeat: -1,
      yoyo: true
    });

    // this.gameCamera = this.cameras.main;
    // this.gameCamera.startFollow(this.imgPlayer1, false, undefined, undefined, -100, 400).setZoom(1.4);
    // this.gameCamera.setLerp(0.1, 0.1);



    // await this.createQuestion()
    // this.createAnswerPanel();

    this.enterBtn = this.add.text(Number(this.game.config.width) / 2, 1500, "Enter the Ring", {
      fontSize: "64px",
      backgroundColor: "#007bff",
      padding: { x: 10, y: 5 },
    }).setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        socket.emit("enterRing");
      }).setOrigin(0.5)

    socket.on("updateGamePlay", async (data) => {
      console.log(data)

      if (this.player == '') {
        if (socket.id === data.player1SocketId) {
          this.player = "Player1";
        } else if (socket.id === data.player2SocketId) {
          this.player = "Player2";
        }
      }
      if (data.isOpponentEntered) {
        if ((this.player == "Player1" && !data.player2SocketId) || (this.player == "Player2" && !data.player1SocketId)) {
          this.imgPlayer2?.setAlpha(0.5)
        } else {
          this.imgPlayer2?.setAlpha(1)
        }
      }

      if ((this.player == "Player1" && data.isPlayer1Ready) || (this.player == "Player2" && data.isPlayer2Ready)) {
        this.enterBtn.destroy()
      }

      if (data.player) {
        if (this.player == data.player) {
          if (data.action == "Appears") {
            if (!data.isOpponentEntered)
              await this.timeDelay(1000)
            this.heroAppears()
          }
          if (data.action == "Enters") {
            this.heroIntro()
          }
        } else {
          if (data.action == "Appears") {
            await this.timeDelay(1000)
            this.opponentAppears()
          }
          if (data.action == "Enters") {
            this.opponentIntro()
          }
        }
      }
    });

  }

  update() {
    if (this.sptDustPlayer1 && this.imgPlayer1) {
      this.sptDustPlayer1!.y = this.imgPlayer1!.y - 50
      this.sptDustPlayer1!.x = this.imgPlayer1!.x - 200
    }
    if (this.imgMaskPlayer1 && this.imgPlayer1) {
      this.imgMaskPlayer1!.y = this.imgPlayer1!.y
      this.imgMaskPlayer1!.x = this.imgPlayer1!.x
    }

    if (this.sptDustPlayer2 && this.imgPlayer2) {
      this.sptDustPlayer2!.y = this.imgPlayer2!.y - 50
      this.sptDustPlayer2!.x = this.imgPlayer2!.x
    }
    if (this.imgMaskPlayer2 && this.imgPlayer2) {
      this.imgMaskPlayer2!.y = this.imgPlayer2!.y
      this.imgMaskPlayer2!.x = this.imgPlayer2!.x
    }
  }

  heroIntro() {
    this.sptDustPlayer1!.play("animDust2");
    this.movePlayer([this.imgPlayer1], 250, 'Expo')
  }

  opponentIntro() {
    this.sptDustPlayer2!.play("animDust2");
    this.movePlayer([this.imgPlayer2], -250, 'Expo')
  }

  heroAppears() {
    this.imgPlayer1?.setAlpha(1)
    this.tweens.add({
      targets: [this.imgPlayer1],
      alpha: 0,
      ease: 'Linear',
      duration: 100,
      repeat: 2,
      yoyo: true,
    });
  }

  opponentAppears() {
    this.imgPlayer2?.setAlpha(1)
    this.tweens.add({
      targets: [this.imgPlayer2],
      alpha: 0,
      ease: 'Linear',
      duration: 100,
      repeat: 2,
      yoyo: true,
    });
  }

  async timeDelay(time: number = 1000): Promise<void> {
    return new Promise((resolve) => {
      this.time.delayedCall(time, () => {
        resolve();
      })
    })
  }

  async cameraZoomIn(): Promise<void> {
    return new Promise((resolve) => {
      this.tweens.add({
        targets: this.gameCamera,
        zoom: 1.4,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          resolve();
        },
      });

      const targetOffset = { x: -100, y: 400 };
      this.tweens.add({
        targets: this.gameCamera!.followOffset,
        x: targetOffset.x,
        y: targetOffset.y,
        duration: 500,
        ease: 'Power2',
        onUpdate: () => {
          this.gameCamera!.setFollowOffset(
            this.gameCamera!.followOffset.x,
            this.gameCamera!.followOffset.y
          );
        }
      });
    });
  }

  async cameraZoomOut(): Promise<void> {
    return new Promise((resolve) => {
      this.tweens.add({
        targets: this.gameCamera,
        zoom: 1,
        duration: 1000,
        ease: 'Linear',
        onComplete: () => {
          resolve();
        },
      });

      const targetOffset = { x: -100, y: 100 };
      this.tweens.add({
        targets: this.gameCamera!.followOffset,
        x: targetOffset.x,
        y: targetOffset.y,
        duration: 100,
        ease: 'Linear',
        onUpdate: () => {
          this.gameCamera!.setFollowOffset(
            this.gameCamera!.followOffset.x,
            this.gameCamera!.followOffset.y
          );
        }
      });
    });
  }

  async movePlayer(gameObjects: Array<any>, value: number, ease: string = 'Expo'): Promise<void> {
    return new Promise((resolve) => {
      this.tweens.add({
        targets: gameObjects,
        x: `+=${value}`,
        ease: ease, // 'Cubic', 'Elastic', 'Bounce', 'Back'
        duration: 1000,
        repeat: 0,
        yoyo: false,
        onComplete: () => {
          resolve();
        },
      });
    });
  }

  async bubbleUp(gameObjects: Array<any>, scaleX: number, scaleY: number): Promise<void> {
    return new Promise((resolve) => {
      this.tweens.add({
        targets: gameObjects,
        scaleX: scaleX,
        scaleY: scaleY,
        ease: 'Back', // 'Cubic', 'Elastic', 'Bounce', 'Back', 'Linear'
        duration: 300,
        repeat: 0,
        yoyo: false,
        onComplete: () => {
          resolve();
        },
      });
    });
  }

  async bubbleDown(gameObjects: Array<any>): Promise<void> {
    return new Promise((resolve) => {
      this.tweens.add({
        targets: gameObjects,
        scaleX: 0,
        scaleY: 0,
        ease: 'Back', // 'Cubic', 'Elastic', 'Bounce', 'Back', 'Linear'
        duration: 500,
        repeat: 0,
        yoyo: false,
        onComplete: () => {
          resolve();
        },
      });
    });
  }

  createAnswerPanel() {
    const buttonSpacingX = Number(this.game.config.width) / 4 - 10;
    const buttonSpacingY = 200;
    const startX = Number(this.game.config.width) / 2 - buttonSpacingX;
    const startY = Number(this.game.config.height) - 350;

    for (let i = 0; i < 4; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);

      const buttonX = startX + col * buttonSpacingX * 2;
      const buttonY = startY + row * buttonSpacingY;

      const buttonImage = this.add.image(0, 0, 'imgOption')
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(300)
        .setScale(0.25).setName("image")

      const buttonResult = this.add.image(220, 0, questions[this.currentQuestion].options[i] == questions[this.currentQuestion].answer ? 'imgCorrect' : 'imgWrong')
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(300)
        .setScale(0).setName("result")

      const buttonText = this.add.text(0, - 10, questions[this.currentQuestion].options[i], {
        fontFamily: 'Arial',
        fontSize: 50,
        color: '#fff',
        align: 'center',
      })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(300).setName("text")

      const buttonContainer = this.add.container(buttonX, buttonY, [buttonImage, buttonText, buttonResult]).setScale(0);
      buttonImage.setInteractive({ useHandCursor: true });

      buttonImage.on('pointerover', () => {
        buttonContainer.setScale(1);
      });

      buttonImage.on('pointerout', () => {
        buttonContainer.setScale(0.9);
      });

      buttonImage.on('pointerdown', () => {
        this.clickOption(i);
      });

      this.optionButtons.push(buttonContainer);
    }
    this.bubbleUp(this.optionButtons, 0.9, 0.9)
  }

  async clickOption(optionIndex: number) {
    if (questions[this.currentQuestion].options[optionIndex] === questions[this.currentQuestion].answer) {
      const resultImg: GameObjects.Image = this.optionButtons[optionIndex].getByName("result")
      resultImg.setScale(0.25)
    } else {
      const correctAnswerIndex = questions[this.currentQuestion].options.findIndex((option) => option === questions[this.currentQuestion].answer)
      const correctResultImg: GameObjects.Image = this.optionButtons[correctAnswerIndex].getByName("result")
      correctResultImg.setScale(0.25)
      const wrongResultImg: GameObjects.Image = this.optionButtons[optionIndex].getByName("result")
      wrongResultImg.setScale(0.25)
    }

    this.optionButtons.forEach((option) => {
      option.getByName("image").removeInteractive()
    })
    if (questions[this.currentQuestion].options[optionIndex] === questions[this.currentQuestion].answer) {
      this.imgMaskPlayer1 = this.add.image(0, 0, 'imgMask5').setDepth(100).setScale(0.4);
      this.imgMaskPlayer2 = this.add.image(0, 0, 'imgMask6').setDepth(100).setScale(0.4).setFlipX(true);
    } else {
      this.imgMaskPlayer1 = this.add.image(0, 0, 'imgMask6').setDepth(100).setScale(0.4);
      this.imgMaskPlayer2 = this.add.image(0, 0, 'imgMask5').setDepth(100).setScale(0.4).setFlipX(true);
    }
    await this.timeDelay(1500)
    await this.bubbleDown([this.questionBubble])
    await this.timeDelay(500)
    await this.bubbleDown(this.optionButtons)
    await this.cameraZoomIn()
    await this.timeDelay(1500)
    this.imgMaskPlayer1.destroy()
    this.imgMaskPlayer2.destroy()
    if (questions[this.currentQuestion].options[optionIndex] === questions[this.currentQuestion].answer) {
      this.sptDustPlayer1!.play("animDust");
      this.sptDustPlayer2!.play("animDust2");
      this.imgMaskPlayer1 = this.add.image(0, 0, 'imgMask2').setDepth(100).setScale(0.4);
      this.imgMaskPlayer2 = this.add.image(0, 0, 'imgMask1').setDepth(100).setScale(0.4).setFlipX(true);
    } else {
      this.sptDustPlayer2!.play("animDust");
      this.sptDustPlayer1!.play("animDust2");
      this.imgMaskPlayer1 = this.add.image(0, 0, 'imgMask1').setDepth(100).setScale(0.4);
      this.imgMaskPlayer2 = this.add.image(0, 0, 'imgMask2').setDepth(100).setScale(0.4).setFlipX(true);
    }

    this.movePlayer([this.imgPlayer1], questions[this.currentQuestion].options[optionIndex] === questions[this.currentQuestion].answer ? 200 : -200, questions[this.currentQuestion].options[optionIndex] === questions[this.currentQuestion].answer ? 'Expo' : 'Back')
    await this.movePlayer([this.imgPlayer2], questions[this.currentQuestion].options[optionIndex] === questions[this.currentQuestion].answer ? 200 : -200, questions[this.currentQuestion].options[optionIndex] === questions[this.currentQuestion].answer ? 'Back' : 'Expo')
    await this.timeDelay(1000)
    this.imgMaskPlayer1.destroy()
    this.imgMaskPlayer2.destroy()
    this.questionBubble!.destroy()
    this.optionButtons.forEach((option) => option.destroy())
    this.optionButtons = []
    this.currentQuestion = (this.currentQuestion + 1) % 5
    await this.timeDelay(500)
    await this.createQuestion()
    this.createAnswerPanel();
  }

  async createQuestion() {
    await this.timeDelay(1000)
    await this.cameraZoomOut()
    const imgQuestionBubble = this.add.image(0, - 400, 'imgQuestionBubble').setDepth(100).setScale(0.9);
    const imgQuestionImage = this.add.image(0, - 400, questions[this.currentQuestion].questionImg).setDepth(100).setScale(0.4);

    this.questionBubble = this.add.container(this.imgPlayer1!.x, this.imgPlayer1!.y, [imgQuestionBubble, imgQuestionImage]).setScale(0)
    await this.timeDelay(500)
    await this.bubbleUp([this.questionBubble], 0.9, 0.9)

  }
}
