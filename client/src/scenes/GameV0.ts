// V0 Game Turn Base

import { GameObjects, Scene } from 'phaser';
import questions from '../questions.json';

export class Game extends Scene {
  background: GameObjects.Image | undefined;
  imgHero: GameObjects.Image | undefined;
  imgOpponent: GameObjects.Image | undefined;
  imgMaskHero: GameObjects.Image | undefined;
  imgMaskOpponent: GameObjects.Image | undefined;
  sptDustHero: GameObjects.Sprite | undefined;
  sptDustOpponent: GameObjects.Sprite | undefined;
  gameCamera: Phaser.Cameras.Scene2D.Camera | undefined;
  optionButtons: GameObjects.Container[] = [];
  questionBubble: GameObjects.Container | undefined;
  currentQuestion: number = 0
  playersTween: Phaser.Tweens.Tween | undefined
  player: String = '';
  enterBtn: GameObjects.Text;
  prompt: GameObjects.Text;
  timerEvent: Phaser.Time.TimerEvent;
  indicator: GameObjects.Image;
  timer: GameObjects.Image;

  constructor() {
    super('Game');
  }

  async create() {
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
    this.add.rectangle(Number(this.game.config.width) / 2, 100, Number(this.game.config.width) - 80, 30, 0xffffff).setScrollFactor(0)
    this.indicator = this.add.image(Number(this.game.config.width) / 2, 70, 'imgIndicator').setOrigin(0.5).setScale(0.5).setScrollFactor(0).setAlpha(0);

    this.imgHero = this.add.image(200, 1100, 'imgHero').setDepth(100).setScale(1.5).setFlipX(true).setAlpha(0);
    this.sptDustHero = this.add
      .sprite(0, 0, "sptDust")
      .setOrigin(0)
      .setDepth(2000).setScale(2).setFlipX(true).setFrame(9);

    this.imgOpponent = this.add.image(Number(this.game.config.width) - 200, 1100, 'imgOpponent').setDepth(99).setScale(1.5).setAlpha(0);
    this.sptDustOpponent = this.add
      .sprite(0, 0, "sptDust")
      .setOrigin(0)
      .setDepth(2000).setScale(2).setFrame(9);
    this.timer = this.add
      .sprite(0, 0, "imgTimer")
      .setOrigin(0)
      .setDepth(2000).setScale(0.3).setAlpha(0)

    this.playersTween = this.tweens.add({
      targets: [this.imgHero, this.imgOpponent],
      scaleX: 1.45,
      scaleY: 1.55,
      y: 1095,
      duration: 1000,
      ease: 'Linear',
      repeat: -1,
      yoyo: true
    });

    this.gameCamera = this.cameras.main;
    this.gameCamera.setLerp(0.1, 0.1);

    this.prompt = this.add.text(Number(this.game.config.width) / 2, 1550, "", {
      fontFamily: 'Arial',
      fontSize: "64px",
      color: "#a64245",
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setScrollFactor(0)

    this.heroAppears()
    await this.timeDelay(1000)
    this.opponentAppears()

    this.enterBtn = this.add.text(Number(this.game.config.width) / 2, 1680, "Enter the Ring", {
      fontFamily: 'Arial',
      fontSize: "64px",
      backgroundColor: "#a64245",
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true })
      .on("pointerdown", async () => {
        this.enterBtn.setAlpha(0)
        await this.heroIntro()
        await this.opponentIntro()
        this.gameCamera!.startFollow(this.imgHero!, false, undefined, undefined, -100, 130).setZoom(1);
        this.indicator.setAlpha(1);
        await this.createQuestion()
        this.createAnswerPanel();
      })
  }

  update() {
    if (this.sptDustHero && this.imgHero) {
      this.sptDustHero!.y = this.imgHero!.y - 50
      this.sptDustHero!.x = this.imgHero!.x - 200
    }
    if (this.imgMaskHero && this.imgHero) {
      this.imgMaskHero!.y = this.imgHero!.y
      this.imgMaskHero!.x = this.imgHero!.x
    }

    if (this.sptDustOpponent && this.imgOpponent) {
      this.sptDustOpponent!.y = this.imgOpponent!.y - 50
      this.sptDustOpponent!.x = this.imgOpponent!.x
    }
    if (this.timer && this.imgOpponent) {
      this.timer!.y = this.imgOpponent!.y - 120
      this.timer!.x = this.imgOpponent!.x - 40
    }
    if (this.imgMaskOpponent && this.imgOpponent) {
      this.imgMaskOpponent!.y = this.imgOpponent!.y
      this.imgMaskOpponent!.x = this.imgOpponent!.x
    }
  }

  async heroIntro() {
    this.sptDustHero!.play("animDust2");
    await this.movePlayer([this.imgHero], 250, 'Expo')
  }

  async opponentIntro() {
    this.sptDustOpponent!.play("animDust2");
    await this.movePlayer([this.imgOpponent], -250, 'Expo')
  }

  heroAppears() {
    this.imgHero?.setAlpha(1)
    this.tweens.add({
      targets: [this.imgHero],
      alpha: 0,
      ease: 'Linear',
      duration: 100,
      repeat: 2,
      yoyo: true,
    });
  }

  opponentAppears() {
    this.imgOpponent?.setAlpha(1)
    this.tweens.add({
      targets: [this.imgOpponent],
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
    console.log(this.imgHero!.x)
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
    let remainingTime = 10
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: async () => {
        remainingTime--;
        this.questionBubble?.getByName('TIMER').setText(`${remainingTime}s`);
        if (remainingTime <= 0) {
          this.optionButtons.forEach((option) => {
            option.getByName("image").removeInteractive()
          })
          this.timerEvent.remove();
          this.questionBubble?.getByName('TIMER').setText(`${remainingTime}s`);
          this.imgMaskHero = this.add.image(0, 0, 'imgMask6').setDepth(100).setScale(0.4);
          // this.imgMaskOpponent = this.add.image(0, 0, 'imgMask5').setDepth(100).setScale(0.4).setFlipX(true);

          await this.timeDelay(1500)
          await this.bubbleDown([this.questionBubble])
          await this.timeDelay(500)
          await this.bubbleDown(this.optionButtons)
          // await this.cameraZoomIn()
          await this.timeDelay(1000)
          this.imgMaskHero.destroy()
          // this.imgMaskOpponent.destroy()
          this.questionBubble!.destroy()
          this.optionButtons.forEach((option) => option.destroy())
          this.optionButtons = []
          this.opponentMove()
        }
      },
      loop: true
    });
  }

  async clickOption(optionIndex: number) {
    this.timerEvent.remove();
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
      this.imgMaskHero = this.add.image(0, 0, 'imgMask5').setDepth(100).setScale(0.4);
      // this.imgMaskOpponent = this.add.image(0, 0, 'imgMask6').setDepth(100).setScale(0.4).setFlipX(true);
    } else {
      this.imgMaskHero = this.add.image(0, 0, 'imgMask6').setDepth(100).setScale(0.4);
      // this.imgMaskOpponent = this.add.image(0, 0, 'imgMask5').setDepth(100).setScale(0.4).setFlipX(true);
    }
    await this.timeDelay(1500)
    await this.bubbleDown([this.questionBubble])
    await this.timeDelay(500)
    await this.bubbleDown(this.optionButtons)
    // await this.cameraZoomIn()
    await this.timeDelay(1500)
    this.imgMaskHero.destroy()
    // this.imgMaskOpponent.destroy()
    this.questionBubble!.destroy()
    this.optionButtons.forEach((option) => option.destroy())
    this.optionButtons = []
    if (questions[this.currentQuestion].options[optionIndex] === questions[this.currentQuestion].answer) {
      await this.heroAttack()
    }
    if (this.imgHero!.x > 1400) {
      this.heroWins()
    } else {
      this.opponentMove()
    }

  }

  async opponentMove() {
    this.timer.setAlpha(1)
    await this.timeDelay(1500)
    this.timer.setAlpha(0)
    if (Math.random() > 0.5) {
      await this.opponentAttack()
    } else {
      this.imgMaskOpponent = this.add.image(0, 0, 'imgMask6').setDepth(100).setScale(0.4).setFlipX(true);
      await this.timeDelay(1000)
      this.imgMaskOpponent.destroy()
    }
    if (this.imgHero!.x < -500) {
      this.opponentWins()
    } else {
      this.currentQuestion = (this.currentQuestion + 1) % 5
      await this.createQuestion()
      this.createAnswerPanel();
    }
  }

  async heroAttack() {
    this.sptDustHero!.play("animDust");
    this.sptDustOpponent!.play("animDust2");
    this.imgMaskHero = this.add.image(0, 0, 'imgMask2').setDepth(100).setScale(0.4);
    this.imgMaskOpponent = this.add.image(0, 0, 'imgMask1').setDepth(100).setScale(0.4).setFlipX(true);
    this.movePlayer([this.imgHero], 200, 'Expo')
    await this.movePlayer([this.imgOpponent], 200, 'Back')
    this.indicator!.x = 40 + ((this.imgHero!.x + 550) / 200) * 100
    await this.timeDelay(1000)
    this.imgMaskHero.destroy()
    this.imgMaskOpponent.destroy()
  }

  async opponentAttack() {
    this.sptDustOpponent!.play("animDust");
    this.sptDustHero!.play("animDust2");
    this.imgMaskHero = this.add.image(0, 0, 'imgMask1').setDepth(100).setScale(0.4);
    this.imgMaskOpponent = this.add.image(0, 0, 'imgMask2').setDepth(100).setScale(0.4).setFlipX(true);
    this.movePlayer([this.imgHero], -200, 'Back')
    await this.movePlayer([this.imgOpponent], -200, 'Expo')
    this.indicator!.x = 40 + ((this.imgHero!.x + 550) / 200) * 100
    await this.timeDelay(1000)
    this.imgMaskHero.destroy()
    this.imgMaskOpponent.destroy()
  }

  async createQuestion() {
    await this.timeDelay(1000)
    // await this.cameraZoomOut()
    const imgQuestionBubble = this.add.image(0, - 400, 'imgQuestionBubble').setDepth(100).setScale(0.9);
    const imgQuestionImage = this.add.image(0, - 400, questions[this.currentQuestion].questionImg).setDepth(100).setScale(0.4);
    const imgQuestionTimer = this.add.text(0, -640, "10s", {
      fontFamily: 'Arial',
      color: '#000',
      fontSize: "64px",
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setName('TIMER')

    this.questionBubble = this.add.container(this.imgHero!.x, this.imgHero!.y, [imgQuestionBubble, imgQuestionImage, imgQuestionTimer]).setScale(0)
    await this.timeDelay(500)
    await this.bubbleUp([this.questionBubble], 0.9, 0.9)

  }

  heroWins() {
    this.imgMaskHero = this.add.image(0, 0, 'imgMask8').setDepth(100).setScale(0.4);
    this.imgMaskOpponent = this.add.image(0, 0, 'imgMask7').setDepth(100).setScale(0.4).setFlipX(true);
    this.prompt.setText("You Win!")
    this.add.text(Number(this.game.config.width) / 2, 1680, "Restart", {
      fontFamily: 'Arial',
      fontSize: "64px",
      backgroundColor: "#a64245",
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true })
      .on("pointerdown", async () => {
        location.reload();
      })
  }

  opponentWins() {
    this.imgMaskHero = this.add.image(0, 0, 'imgMask7').setDepth(100).setScale(0.4);
    this.imgMaskOpponent = this.add.image(0, 0, 'imgMask8').setDepth(100).setScale(0.4).setFlipX(true);
    this.prompt.setText("You Lost!")
    this.add.text(Number(this.game.config.width) / 2, 1680, "Restart", {
      fontFamily: 'Arial',
      fontSize: "64px",
      backgroundColor: "#a64245",
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true })
      .on("pointerdown", async () => {
        location.reload();
      })
  }
}
