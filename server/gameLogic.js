const setupGameLogic = (io, gameState) => {
    io.on("connection", (socket) => {
      console.log(`Player connected: ${socket.id}`);
  
      if (!gameState.player1Socket) {
        if (!gameState.isOpponentEntered && gameState.player2Socket) {
          gameState.isOpponentEntered = true;
        }
        gameState.player1Socket = socket;
        if (gameState.player2Socket)
          gameState.player2Socket.emit("updateGamePlay", {
            isOpponentEntered: gameState.isOpponentEntered,
            isFightStarted: gameState.isFightStarted,
            player1Position: gameState.player1Position,
            player2Position: gameState.player2Position,
            player1SocketId: gameState.player1Socket.id,
            player2SocketId: gameState.player2Socket.id,
            isPlayer1Ready: gameState.isPlayer1Ready,
            isPlayer2Ready: gameState.isPlayer2Ready,
            player: "Player1",
            action: "Appears",
            currentTurn: gameState.currentTurn,
            isGameEnded: gameState.isGameEnded,
          });
      } else if (!gameState.player2Socket) {
        if (!gameState.isOpponentEntered && gameState.player1Socket) {
          gameState.isOpponentEntered = true;
        }
        gameState.player2Socket = socket;
        if (gameState.player1Socket)
          gameState.player1Socket.emit("updateGamePlay", {
            isOpponentEntered: gameState.isOpponentEntered,
            isFightStarted: gameState.isFightStarted,
            player1Position: gameState.player1Position,
            player2Position: gameState.player2Position,
            player1SocketId: gameState.player1Socket.id,
            player2SocketId: gameState.player2Socket.id,
            isPlayer1Ready: gameState.isPlayer1Ready,
            isPlayer2Ready: gameState.isPlayer2Ready,
            player: "Player2",
            action: "Appears",
            currentTurn: gameState.currentTurn,
            isGameEnded: gameState.isGameEnded,
          });
      }
  
      socket.on("disconnect", () => {
        console.log(`Player disconnected: ${socket.id}`);
        if (socket === gameState.player1Socket) gameState.player1Socket = null;
        if (socket === gameState.player2Socket) gameState.player2Socket = null;
  
        io.emit("updateGamePlay", {
          isOpponentEntered: gameState.isOpponentEntered,
          isFightStarted: gameState.isFightStarted,
          player1Position: gameState.player1Position,
          player2Position: gameState.player2Position,
          player1SocketId: gameState.player1Socket ? gameState.player1Socket.id : null,
          player2SocketId: gameState.player2Socket ? gameState.player2Socket.id : null,
          player: null,
          action: null,
        });
      });
    });
  };
  
  module.exports = { setupGameLogic };