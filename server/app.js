const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // The client URL (adjust accordingly)
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 8080;

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

io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  if (!player1Socket) {
    if (!isOpponentEntered && player2Socket) {
      isOpponentEntered = true;
    }
    player1Socket = socket;
    if (player2Socket && player2Socket.id != "bot")
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

  // If no second player connects within 10 seconds, start a bot
  if (!player2Socket && !player2IsBot) {
    setTimeout(() => {
      if (!player2Socket) {
        player2IsBot = true;
        player2Socket = { id: "bot" }; // Simulate a bot socket
        isOpponentEntered = true;
        io.emit("updateGamePlay", {
          isOpponentEntered: isOpponentEntered,
          isFightStarted: isFightStarted,
          player1Position: player1Position,
          player2Position: player2Position,
          player1SocketId: player1Socket ? player1Socket.id : null,
          player2SocketId: "bot",
          isPlayer1Ready: isPlayer1Ready,
          isPlayer2Ready: isPlayer2Ready,
          player: "Player2",
          action: "Appears",
          currentTurn: currentTurn,
          isGameEnded: isGameEnded,
        });
      }
    }, 10000); // 10 seconds
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
      if (player2IsBot && currentTurn === "Player2") {
        botMove();
      }
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
      if (player2IsBot && currentTurn === "Player2") {
        botMove();
      }
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
      if (player2IsBot && !isPlayer2Ready) {
        setTimeout(() => {
          botEnterRing();
        }, 1000);
      }
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

function botEnterRing() {
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
        player2SocketId: "bot",
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
    player2SocketId: "bot",
    isPlayer1Ready: isPlayer1Ready,
    isPlayer2Ready: isPlayer2Ready,
    player: "Player2",
    action: "Enters",
    currentTurn: currentTurn,
  });
}

function botMove() {
  setTimeout(() => {
    const randomAction = Math.random() > 0.2 ? "attack" : "miss";
    if (randomAction === "attack") {
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
        player2SocketId: "bot",
        isPlayer1Ready: isPlayer1Ready,
        isPlayer2Ready: isPlayer2Ready,
        player: "Player2",
        action: "Attacks",
        currentTurn: currentTurn,
        isGameEnded: isGameEnded,
      });
    } else {
      currentTurn = "Player1";
      io.emit("updateGamePlay", {
        isOpponentEntered: isOpponentEntered,
        isFightStarted: isFightStarted,
        player1Position: player1Position,
        player2Position: player2Position,
        player1SocketId: player1Socket ? player1Socket.id : null,
        player2SocketId: "bot",
        isPlayer1Ready: isPlayer1Ready,
        isPlayer2Ready: isPlayer2Ready,
        player: "Player2",
        action: "Misses",
        currentTurn: currentTurn,
      });
    }
  }, 5000); // Simulate bot thinking time
}

// Start the server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}!`);
});


app.get("/", (req, res) => {
  res.status(200).send("Server is running!");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
