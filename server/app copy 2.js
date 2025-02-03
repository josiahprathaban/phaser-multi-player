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

let player1Socket = null;
let player2Socket = null;
let player1Position = 200;
let player2Position = 200;
let isPlayer1Ready = false;
let isPlayer2Ready = false;
let isOpponentEntered = false;
let isFightStarted = false;
let currentTurn = null;
let isGameEnded = false;

let player2IsBot = false;
let botInterval = null;

io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  if (!player1Socket) {
    if (!isOpponentEntered && player2Socket) {
      isOpponentEntered = true;
    }
    player1Socket = socket;
    if (player2Socket)
      player2Socket.emit("updateGamePlay", {
        isOpponentEntered: isOpponentEntered,
        isFightStarted: isFightStarted,
        player1Position: player1Position,
        player2Position: player2Position,
        player1SocketId: player1Socket.id,
        player2SocketId: player2Socket.id,
        isPlayer1Ready: isPlayer1Ready,
        isPlayer2Ready: isPlayer2Ready,
        player: "Player1",
        action: "Appears",
        currentTurn: currentTurn,
        isGameEnded: isGameEnded,
      });
  } else if (!player2Socket) {
    if (!isOpponentEntered && player1Socket) {
      isOpponentEntered = true;
    }
    player2Socket = socket;
    if (player1Socket)
      player1Socket.emit("updateGamePlay", {
        isOpponentEntered: isOpponentEntered,
        isFightStarted: isFightStarted,
        player1Position: player1Position,
        player2Position: player2Position,
        player1SocketId: player1Socket.id,
        player2SocketId: player2Socket.id,
        isPlayer1Ready: isPlayer1Ready,
        isPlayer2Ready: isPlayer2Ready,
        player: "Player2",
        action: "Appears",
        currentTurn: currentTurn,
        isGameEnded: isGameEnded,
      });
  }

  socket.on("handShake", () => {
    if (socket === player1Socket) {
      player1Socket.emit("updateGamePlay", {
        isOpponentEntered: isOpponentEntered,
        isFightStarted: isFightStarted,
        player1Position: player1Position,
        player2Position: player2Position,
        player1SocketId: player1Socket ? player1Socket.id : null,
        player2SocketId: player2Socket ? player2Socket.id : null,
        isPlayer1Ready: isPlayer1Ready,
        isPlayer2Ready: isPlayer2Ready,
        player: "Player1",
        action: "Appears",
        currentTurn: currentTurn,
        isGameEnded: isGameEnded,
      });
    } else if (socket === player2Socket) {
      player2Socket.emit("updateGamePlay", {
        isOpponentEntered: isOpponentEntered,
        isFightStarted: isFightStarted,
        player1Position: player1Position,
        player2Position: player2Position,
        player1SocketId: player1Socket ? player1Socket.id : null,
        player2SocketId: player2Socket ? player2Socket.id : null,
        isPlayer1Ready: isPlayer1Ready,
        isPlayer2Ready: isPlayer2Ready,
        player: "Player2",
        action: "Appears",
        currentTurn: currentTurn,
        isGameEnded: isGameEnded,
      });
    }
  });

  socket.on("attack", () => {
    if (socket === player1Socket) {
      player1Position += 200;
      player2Position -= 200;
      isGameEnded = player1Position > 1400;
      currentTurn = "Player2";
      io.emit("updateGamePlay", {
        isOpponentEntered: isOpponentEntered,
        isFightStarted: isFightStarted,
        player1Position: player1Position,
        player2Position: player2Position,
        player1SocketId: player1Socket ? player1Socket.id : null,
        player2SocketId: player2Socket ? player2Socket.id : null,
        isPlayer1Ready: isPlayer1Ready,
        isPlayer2Ready: isPlayer2Ready,
        player: "Player1",
        action: "Attacks",
        currentTurn: currentTurn,
        isGameEnded: isGameEnded,
      });
    } else if (socket === player2Socket) {
      player1Position -= 200;
      player2Position += 200;
      isGameEnded = player2Position > 1400;
      currentTurn = "Player1";
      io.emit("updateGamePlay", {
        isOpponentEntered: isOpponentEntered,
        isFightStarted: isFightStarted,
        player1Position: player1Position,
        player2Position: player2Position,
        player1SocketId: player1Socket ? player1Socket.id : null,
        player2SocketId: player2Socket ? player2Socket.id : null,
        isPlayer1Ready: isPlayer1Ready,
        isPlayer2Ready: isPlayer2Ready,
        player: "Player2",
        action: "Attacks",
        currentTurn: currentTurn,
        isGameEnded: isGameEnded,
      });
    }
  });

  socket.on("miss", () => {
    if (socket === player1Socket) {
      currentTurn = "Player2";
      io.emit("updateGamePlay", {
        isOpponentEntered: isOpponentEntered,
        isFightStarted: isFightStarted,
        player1Position: player1Position,
        player2Position: player2Position,
        player1SocketId: player1Socket ? player1Socket.id : null,
        player2SocketId: player2Socket ? player2Socket.id : null,
        isPlayer1Ready: isPlayer1Ready,
        isPlayer2Ready: isPlayer2Ready,
        player: "Player1",
        action: "Misses",
        currentTurn: currentTurn,
      });
    } else if (socket === player2Socket) {
      currentTurn = "Player1";
      io.emit("updateGamePlay", {
        isOpponentEntered: isOpponentEntered,
        isFightStarted: isFightStarted,
        player1Position: player1Position,
        player2Position: player2Position,
        player1SocketId: player1Socket ? player1Socket.id : null,
        player2SocketId: player2Socket ? player2Socket.id : null,
        isPlayer1Ready: isPlayer1Ready,
        isPlayer2Ready: isPlayer2Ready,
        player: "Player2",
        action: "Misses",
        currentTurn: currentTurn,
      });
    }
  });

  socket.on("enterRing", () => {
    if (socket === player1Socket) {
      isPlayer1Ready = true;
      player1Position += 250;
      if (isPlayer1Ready && isPlayer2Ready) {
        setTimeout(() => {
          isFightStarted = true;
          currentTurn = "Player1";
          io.emit("updateGamePlay", {
            isOpponentEntered: isOpponentEntered,
            isFightStarted: isFightStarted,
            player1Position: player1Position,
            player2Position: player2Position,
            player1SocketId: player1Socket ? player1Socket.id : null,
            player2SocketId: player2Socket ? player2Socket.id : null,
            isPlayer1Ready: isPlayer1Ready,
            isPlayer2Ready: isPlayer2Ready,
            player: null,
            action: "Fight Started",
            currentTurn: currentTurn,
          });
        }, 2000);
      }
      io.emit("updateGamePlay", {
        isOpponentEntered: isOpponentEntered,
        isFightStarted: isFightStarted,
        player1Position: player1Position,
        player2Position: player2Position,
        player1SocketId: player1Socket ? player1Socket.id : null,
        player2SocketId: player2Socket ? player2Socket.id : null,
        isPlayer1Ready: isPlayer1Ready,
        isPlayer2Ready: isPlayer2Ready,
        player: "Player1",
        action: "Enters",
        currentTurn: currentTurn,
      });
    } else if (socket === player2Socket) {
      isPlayer2Ready = true;
      player2Position += 250;
      if (isPlayer1Ready && isPlayer2Ready) {
        setTimeout(() => {
          isFightStarted = true;
          currentTurn = "Player1";
          io.emit("updateGamePlay", {
            isOpponentEntered: isOpponentEntered,
            isFightStarted: isFightStarted,
            player1Position: player1Position,
            player2Position: player2Position,
            player1SocketId: player1Socket ? player1Socket.id : null,
            player2SocketId: player2Socket ? player2Socket.id : null,
            isPlayer1Ready: isPlayer1Ready,
            isPlayer2Ready: isPlayer2Ready,
            player: null,
            action: "Fight Started",
            currentTurn: currentTurn,
          });
        }, 2000);
      }
      io.emit("updateGamePlay", {
        isOpponentEntered: isOpponentEntered,
        isFightStarted: isFightStarted,
        player1Position: player1Position,
        player2Position: player2Position,
        player1SocketId: player1Socket ? player1Socket.id : null,
        player2SocketId: player2Socket ? player2Socket.id : null,
        isPlayer1Ready: isPlayer1Ready,
        isPlayer2Ready: isPlayer2Ready,
        player: "Player2",
        action: "Enters",
        currentTurn: currentTurn,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
    if (socket === player1Socket) player1Socket = null;
    if (socket === player2Socket) player2Socket = null;

    io.emit("updateGamePlay", {
      isOpponentEntered: isOpponentEntered,
      isFightStarted: isFightStarted,
      player1Position: player1Position,
      player2Position: player2Position,
      player1SocketId: player1Socket ? player1Socket.id : null,
      player2SocketId: player2Socket ? player2Socket.id : null,
      player: null,
      action: null,
    });
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
