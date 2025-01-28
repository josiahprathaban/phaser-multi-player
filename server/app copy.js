const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // The client URL (adjust accordingly)
    methods: ["GET", "POST"],
  },
});

const PORT = 3000;

// Initialize player counters and state
let player1Counter = 0;
let player2Counter = 0;
let player1Socket = null;
let player2Socket = null;
let player2IsBot = false;
let waitingForOpponent = true;
let botInterval = null; // Store the bot's interval

let currentTurn = 0;

// Handle client connections
io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  if (!player1Socket) {
    // Assign player 1
    player1Socket = socket;
    socket.emit("updateCounters", {
      player1Counter,
      player2Counter,
      player1SocketId: player1Socket.id,
      player2SocketId: player2Socket ? player2Socket.id : null,
      message: "Waiting for opponent...",
    });
  } else if (!player2Socket) {
    // Assign player 2
    player2Socket = socket;
    waitingForOpponent = false;

    // Notify both players that the opponent is found
    player1Socket.emit("updateCounters", {
      player1Counter,
      player2Counter,
      player1SocketId: player1Socket.id,
      player2SocketId: player2Socket.id,
      message: "Opponent found! Start playing!",
      currentTurn: currentTurn,
    });

    player2Socket.emit("updateCounters", {
      player1Counter,
      player2Counter,
      player1SocketId: player1Socket.id,
      player2SocketId: player2Socket.id,
      message: "Opponent found! Start playing!",
      currentTurn: currentTurn,
    });

    setTimeout(() => {
      currentTurn = 1
      io.emit("updateCounters", {
        player1Counter,
        player2Counter,
        player1SocketId: player1Socket.id,
        player2SocketId: player2Socket ? player2Socket.id : null,
        message: `Draw is decided!`,
        currentTurn: currentTurn,
      });
    }, 1000);
  }

  // Wait for 10 seconds for a second player
  setTimeout(() => {
    if (!player2Socket && !player2IsBot) {
      console.log("No opponent found, starting bot gameplay!");
      player2IsBot = true;

      // Bot will automatically increase its counter every second
      botInterval = setInterval(() => {
        if (player2IsBot) {
          player2Counter++; // Bot increases its counter
          player1Counter--; // Player 1's counter decreases

          io.emit("updateCounters", {
            player1Counter,
            player2Counter,
            player1SocketId: player1Socket.id,
            player2SocketId: player2Socket ? player2Socket.id : null,
            message: "Playing with the bot...",
          });

          // Check for winner
          if (player1Counter <= -50 || player2Counter >= 50) {
            io.emit("gameOver", { winner: "Player 1 (Bot)" });
            clearInterval(botInterval); // Stop the bot's interval when the game ends
          }
        }
      }, 5000); // Bot increases every second
    }
  }, 10000); // 10 seconds timeout for waiting for opponent

  // Listen for "increaseCounter" event
  socket.on("increaseCounter", () => {
    if (socket === player1Socket) {
      player1Counter++;
      player2Counter--;
    } else if (socket === player2Socket || player2IsBot) {
      player2Counter++;
      player1Counter--;
    }

    // Broadcast updated counters
    io.emit("updateCounters", {
      player1Counter,
      player2Counter,
      player1SocketId: player1Socket.id,
      player2SocketId: player2Socket ? player2Socket.id : null,
      message: player2IsBot
        ? "Playing with the bot..."
        : "Both players are playing!",
      canStart: true,
      currentTurn: currentTurn,
    });

    // Check for winner
    if (player1Counter === 50) {
      io.emit("gameOver", { winner: "Player 1" });
      clearInterval(botInterval); // Stop the bot's interval when the game ends
    } else if (player2Counter === 50) {
      io.emit("gameOver", {
        winner: player2IsBot ? "Player 1 (Bot)" : "Player 2",
      });
      clearInterval(botInterval); // Stop the bot's interval when the game ends
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
    if (socket === player1Socket) player1Socket = null;
    if (socket === player2Socket) player2Socket = null;
    if (player2IsBot) {
      clearInterval(botInterval); // Stop the bot's interval if the second player disconnects
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
