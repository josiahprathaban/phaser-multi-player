import Phaser from "phaser";
import socket from "../socket";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    // Player ID storage
    this.playerId = null;

    // Display text for counter
    this.localCounterText = this.add.text(300, 250, "Your Counter: 0", {
      fontSize: "32px",
      fill: "#fff",
    });

    // Display message
    this.stateMessage = this.add.text(300, 200, "", {
      fontSize: "24px",
      fill: "#fff",
    });

    // Create the "Increase Counter" button
    this.increaseButton = this.add.text(300, 350, "Increase Counter", {
      fontSize: "24px",
      fill: "#fff",
      backgroundColor: "#007bff",
      padding: { x: 10, y: 5 },
    });

    // Listen for counter updates and messages
    socket.on("updateCounters", (data) => {
      console.log(data);
      if (!this.playerId) {
        // Assign player ID (Player 1 or Player 2)
        if (socket.id === data.player1SocketId) {
          this.playerId = "player1";
          this.increaseButton
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
              console.log("Button clicked, emitting 'increaseCounter'");
              socket.emit("increaseCounter"); // Notify the server to increase counter
            });
        } else if (socket.id === data.player2SocketId) {
          this.playerId = "player2";
        }
      }

      // Update the local player's counter
      if (this.playerId === "player1") {
        this.localCounterText.setText(`Your Counter: ${data.player1Counter}`);
      } else if (this.playerId === "player2") {
        this.localCounterText.setText(`Your Counter: ${data.player2Counter}`);
      }

      // Update the state message
      this.stateMessage.setText(data.message);
    });

    // Listen for the game over event
    socket.on("gameOver", (data) => {
      this.add.text(300, 400, `${data.winner} wins!`, {
        fontSize: "48px",
        fill: "#ff0000",
      });
      // this.increaseButton.setVisible(false); // Hide the button after the game ends
    });
  }
}
