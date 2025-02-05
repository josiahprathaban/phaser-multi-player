import { GameObjects, Scene } from 'phaser';
import questions from '../questions.json';
import socket from "../socket";

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
    this.add.rectangle(Number(this.game.config.width) / 2, 100, Number(this.game.config.width) - 80, 30, 0xff0000).setScrollFactor(0)
    this.indicator = this.add.image(Number(this.game.config.width) / 2, 100, 'imgIndicator').setOrigin(0.5).setScale(0.5).setScrollFactor(0).setAlpha(0);

    console.log(Number(this.game.config.width) / 2)

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

    this.prompt = this.add.text(Number(this.game.config.width) / 2, 1350, "", {
      fontSize: "42px",
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setScrollFactor(0)

    this.enterBtn = this.add.text(Number(this.game.config.width) / 2, 1500, "Enter the Ring", {
      fontSize: "64px",
      backgroundColor: "#007bff",
      padding: { x: 10, y: 5 },
    }).setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        socket.emit("enterRing");
      }).setOrigin(0.5).setAlpha(0).setScrollFactor(0)

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
          this.prompt.setText("Opponent lost connection. Waiting...")
          this.imgOpponent?.setAlpha(0.5)
        } else {
          this.imgOpponent?.setAlpha(1)
        }
        if (!data.isFightStarted)
          this.enterBtn.setAlpha(1)
      }

      if ((this.player == "Player1" && data.isPlayer1Ready) || (this.player == "Player2" && data.isPlayer2Ready)) {
        this.enterBtn.destroy()
      }

      if (data.player) {
        if (data.action == "Appears") {
          if (this.player == "Player1") {
            this.imgHero!.x = data.player1Position
            this.imgOpponent!.x = Number(this.game.config.width) - data.player2Position
            this.indicator!.x = 40 + ((data.player1Position + 550) / 200) * 100
            console.log(this.indicator!.x)
            console.log(data.player1Position)
          } else if (this.player == "Player2") {
            this.imgHero!.x = data.player2Position
            this.imgOpponent!.x = Number(this.game.config.width) - data.player1Position
            this.indicator!.x = 80 + ((data.player2Position + 550) / 200) * 100
          }
        }

        if (data.action == "Attacks") {
          if (this.player == "Player1") {
            this.indicator!.x = 40 + ((data.player1Position + 550) / 200) * 100
          } else if (this.player == "Player2") {
            this.indicator!.x = 40 + ((data.player2Position + 550) / 200) * 100
          }
        }

        if (data.action == "Enters") {
          if (this.player == "Player1") {
            this.indicator!.x = 40 + ((data.player1Position + 550) / 200) * 100
          } else if (this.player == "Player2") {
            this.indicator!.x = 40 + ((data.player2Position + 550) / 200) * 100
          }
        }

        if (this.player == data.player) {
          if (data.action == "Appears") {
            if (!data.isOpponentEntered) {
              await this.timeDelay(1000)
              this.prompt.setText("Waiting for opponent...")
            }
            this.heroAppears()
            if (data.isFightStarted) {
              this.gameCamera!.startFollow(this.imgHero!, false, undefined, undefined, -100, 100).setZoom(1);
              this.indicator.setAlpha(1);
              if (data.isGameEnded) {
                this.prompt.setText("Game Finished!")
              } else {
                if (this.player == data.currentTurn) {
                  this.prompt.setText("It's your move.")
                  await this.createQuestion()
                  this.createAnswerPanel();
                } else if ((this.player == "Player1" && data.player2SocketId) || (this.player == "Player2" && data.player1SocketId)) {
                  this.prompt.setText("Opponent is thinking... It's their turn.")
                }
              }
            }
          }
          if (data.action == "Enters") {
            this.prompt.setText("You are entering the ring...")
            this.heroIntro()
            this.gameCamera!.startFollow(this.imgHero!, false, undefined, undefined, -100, 100).setZoom(1);
            if (data.isPlayer1Ready && data.isPlayer2Ready) {
              await this.timeDelay(1000)
              this.prompt.setText("The toss is called!")
              this.indicator.setAlpha(1);
            }
          }
          if (data.action == "Attacks") {
            this.prompt.setText("You are attacking.")
            await this.heroAttack()
            if (data.isGameEnded) {
              this.prompt.setText("You Won!")
            }
            else {
              if (this.player == data.currentTurn) {
                this.prompt.setText("It's your move.")
                this.currentQuestion = (this.currentQuestion + 1) % 5
                await this.timeDelay(500)
                await this.createQuestion()
                this.createAnswerPanel();
              } else {
                this.prompt.setText("Opponent is thinking... It's their turn.")
              }
            }

          }
          if (data.action == "Misses") {
            this.prompt.setText("You missed your chance.")
            await this.timeDelay(1500)
            if (this.player == data.currentTurn) {
              this.prompt.setText("It's your move.")
              this.currentQuestion = (this.currentQuestion + 1) % 5
              await this.timeDelay(500)
              await this.createQuestion()
              this.createAnswerPanel();
            } else {
              this.prompt.setText("Opponent is thinking... It's their turn.")
            }
          }
        } else {
          if (data.action == "Appears") {
            if (!data.isFightStarted) {
              this.prompt.setText("Opponent has joined!")
            }
            else {
              this.prompt.setText("")
            }

            await this.timeDelay(1000)
            this.opponentAppears()
            if (data.isFightStarted && this.player != data.currentTurn) {
              this.prompt.setText("Opponent is thinking... It's their turn.")
            }
          }
          if (data.action == "Enters") {
            this.prompt.setText("Opponent is entering the ring...")
            this.opponentIntro()
            if (data.isPlayer1Ready && data.isPlayer2Ready) {
              await this.timeDelay(1000)
              this.prompt.setText("The toss is called!")
              this.indicator.setAlpha(1);
            }
          }
          if (data.action == "Attacks") {
            this.prompt.setText("Opponent is attacking.")
            await this.opponentAttack()
            if (data.isGameEnded) {
              this.prompt.setText("You Lost!")
            } else {
              if (this.player == data.currentTurn) {
                this.prompt.setText("It's your move.")
                this.currentQuestion = (this.currentQuestion + 1) % 5
                await this.timeDelay(500)
                await this.createQuestion()
                this.createAnswerPanel();
              } else {
                this.prompt.setText("Opponent is thinking... It's their turn.")
              }
            }
          }
          if (data.action == "Misses") {
            this.prompt.setText("Opponent missed their chance.")
            await this.timeDelay(1500)
            if (this.player == data.currentTurn) {
              this.prompt.setText("It's your move.")
              this.currentQuestion = (this.currentQuestion + 1) % 5
              await this.timeDelay(500)
              await this.createQuestion()
              this.createAnswerPanel();
            } else {
              this.prompt.setText("Opponent is thinking... It's their turn.")
            }
          }
        }
      }

      if (data.currentTurn) {
        if (this.player == data.currentTurn) {
          if (data.action == "Fight Started") {
            this.prompt.setText("You win the toss! It's your move.")
            await this.timeDelay(1000)
            await this.createQuestion()
            this.createAnswerPanel();
          }
        } else {
          if (data.action == "Fight Started") {
            this.prompt.setText("Opponent wins the toss! It's their turn.")
            await this.timeDelay(1000)
            this.prompt.setText("Opponent is thinking... It's their turn.")
          }
        }
      }


    });

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
    if (this.imgMaskOpponent && this.imgOpponent) {
      this.imgMaskOpponent!.y = this.imgOpponent!.y
      this.imgMaskOpponent!.x = this.imgOpponent!.x
    }
  }

  heroIntro() {
    this.sptDustHero!.play("animDust2");
    this.movePlayer([this.imgHero], 250, 'Expo')
  }

  opponentIntro() {
    this.sptDustOpponent!.play("animDust2");
    this.movePlayer([this.imgOpponent], -250, 'Expo')
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
          this.timerEvent.remove();
          this.questionBubble?.getByName('TIMER').setText(`${remainingTime}s`);
          this.imgMaskHero = this.add.image(0, 0, 'imgMask6').setDepth(100).setScale(0.4);
          this.imgMaskOpponent = this.add.image(0, 0, 'imgMask5').setDepth(100).setScale(0.4).setFlipX(true);

          await this.timeDelay(1500)
          await this.bubbleDown([this.questionBubble])
          await this.timeDelay(500)
          await this.bubbleDown(this.optionButtons)
          // await this.cameraZoomIn()
          await this.timeDelay(1000)
          this.imgMaskHero.destroy()
          this.imgMaskOpponent.destroy()
          this.questionBubble!.destroy()
          this.optionButtons.forEach((option) => option.destroy())
          this.optionButtons = []

          socket.emit("miss");
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
      this.imgMaskOpponent = this.add.image(0, 0, 'imgMask6').setDepth(100).setScale(0.4).setFlipX(true);
    } else {
      this.imgMaskHero = this.add.image(0, 0, 'imgMask6').setDepth(100).setScale(0.4);
      this.imgMaskOpponent = this.add.image(0, 0, 'imgMask5').setDepth(100).setScale(0.4).setFlipX(true);
    }
    await this.timeDelay(1500)
    await this.bubbleDown([this.questionBubble])
    await this.timeDelay(500)
    await this.bubbleDown(this.optionButtons)
    // await this.cameraZoomIn()
    await this.timeDelay(1500)
    this.imgMaskHero.destroy()
    this.imgMaskOpponent.destroy()
    this.questionBubble!.destroy()
    this.optionButtons.forEach((option) => option.destroy())
    this.optionButtons = []
    if (questions[this.currentQuestion].options[optionIndex] === questions[this.currentQuestion].answer) {
      socket.emit("attack");
    } else {
      socket.emit("miss");
    }
  }

  async heroAttack() {
    this.sptDustHero!.play("animDust");
    this.sptDustOpponent!.play("animDust2");
    this.imgMaskHero = this.add.image(0, 0, 'imgMask2').setDepth(100).setScale(0.4);
    this.imgMaskOpponent = this.add.image(0, 0, 'imgMask1').setDepth(100).setScale(0.4).setFlipX(true);
    this.movePlayer([this.imgHero], 200, 'Expo')
    await this.movePlayer([this.imgOpponent], 200, 'Back')
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
}
