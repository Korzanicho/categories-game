import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { GameManager } from './gameManager.js';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const gameManager = new GameManager();

function generateGameCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generatePlayerName() {
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `Player${random}`;
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create_player', async (data) => {
    let playerId = socket.playerId;
    let playerName = socket.playerName;
    
    if (!playerId) {
      playerId = uuidv4();
      playerName = data.name || generatePlayerName();
      socket.playerId = playerId;
      socket.playerName = playerName;
    } else if (data.name && data.name !== playerName) {
      playerName = data.name;
      socket.playerName = playerName;
      
      if (socket.currentGameCode) {
        const game = await gameManager.getGame(socket.currentGameCode);
        if (game) {
          game.playerNames[playerId] = playerName;
          io.to(socket.currentGameCode).emit('game_updated', game);
        }
      }
    }
    
    socket.emit('player_created', {
      playerId,
      playerName
    });
  });

  socket.on('create_game', async (data) => {
    if (!socket.playerId) {
      socket.emit('error', { message: 'Create player first' });
      return;
    }

    const gameCode = generateGameCode();
    const game = await gameManager.createGame({
      gameCode,
      creatorId: socket.playerId,
      rounds: data.rounds || 6,
      timeLimit: data.timeLimit || 10,
      categories: data.categories || ['Country', 'City', 'Animal', 'Name', 'Thing']
    });

    await gameManager.addPlayer(gameCode, socket.playerId, socket.playerName);

    socket.join(gameCode);
    socket.currentGameCode = gameCode;

    const updatedGame = await gameManager.getGame(gameCode);
    socket.emit('game_created', {
      gameCode,
      game: updatedGame
    });

    io.to(gameCode).emit('game_updated', updatedGame);
  });

  socket.on('join_game', async (data) => {
    if (!socket.playerId) {
      socket.emit('error', { message: 'Create player first' });
      return;
    }

    const game = await gameManager.getGame(data.gameCode);
    if (!game) {
      socket.emit('error', { message: 'Game does not exist' });
      return;
    }

    if (game.status !== 'waiting') {
      socket.emit('error', { message: 'Game already started' });
      return;
    }

    await gameManager.addPlayer(data.gameCode, socket.playerId, socket.playerName);
    socket.join(data.gameCode);
    socket.currentGameCode = data.gameCode;

    const updatedGame = await gameManager.getGame(data.gameCode);
    socket.emit('game_joined', updatedGame);
    io.to(data.gameCode).emit('game_updated', updatedGame);
  });

  socket.on('toggle_ready', async () => {
    if (!socket.currentGameCode || !socket.playerId) return;

    await gameManager.toggleReady(socket.currentGameCode, socket.playerId);
    const game = await gameManager.getGame(socket.currentGameCode);
    io.to(socket.currentGameCode).emit('game_updated', game);
  });

  socket.on('start_game', async () => {
    if (!socket.currentGameCode || !socket.playerId) return;

    const game = await gameManager.getGame(socket.currentGameCode);
    if (game.creatorId !== socket.playerId) {
      socket.emit('error', { message: 'Only creator can start the game' });
      return;
    }

    try {
      const result = await gameManager.startGame(socket.currentGameCode);
      const updatedGame = result.game;
      const removedPlayers = result.removedPlayers;

      io.to(socket.currentGameCode).emit('game_updated', updatedGame);
      io.to(socket.currentGameCode).emit('game_started', updatedGame);

      const socketsInRoom = await io.in(socket.currentGameCode).fetchSockets();
      removedPlayers.forEach(playerId => {
        const playerSocket = socketsInRoom.find(s => s.playerId === playerId);
        if (playerSocket) {
          playerSocket.emit('player_removed', { playerId, reason: 'not_ready' });
          playerSocket.leave(socket.currentGameCode);
          playerSocket.currentGameCode = null;
        }
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('randomize_letter', async () => {
    if (!socket.currentGameCode || !socket.playerId) return;

    const game = await gameManager.getGame(socket.currentGameCode);
    if (game.status !== 'letter_selection') {
      socket.emit('error', { message: 'Invalid game state' });
      return;
    }

    if (game.currentLetterSelector !== socket.playerId) {
      socket.emit('error', { message: 'Not your turn to select letter' });
      return;
    }

    if (game.currentLetter) {
      socket.emit('error', { message: 'Letter already selected' });
      return;
    }

    const randomIndex = Math.floor(Math.random() * ALPHABET.length);
    const letter = ALPHABET[randomIndex];
    
    await gameManager.selectLetter(socket.currentGameCode, letter);
    const updatedGame = await gameManager.getGame(socket.currentGameCode);
    io.to(socket.currentGameCode).emit('game_updated', updatedGame);
    io.to(socket.currentGameCode).emit('letter_selected', {
      letter: letter,
      game: updatedGame
    });

    setTimeout(async () => {
      const game = await gameManager.getGame(socket.currentGameCode);
      if (game && game.status === 'letter_selection' && game.currentLetter === letter) {
        await gameManager.startRound(socket.currentGameCode);
        const roundStartedGame = await gameManager.getGame(socket.currentGameCode);
        io.to(socket.currentGameCode).emit('game_updated', roundStartedGame);
        io.to(socket.currentGameCode).emit('round_started', roundStartedGame);
      }
    }, 3000);
  });

  socket.on('start_round', async () => {
    if (!socket.currentGameCode || !socket.playerId) return;

    const game = await gameManager.getGame(socket.currentGameCode);
    if (game.creatorId !== socket.playerId && game.currentLetterSelector !== socket.playerId) {
      socket.emit('error', { message: 'No permission' });
      return;
    }

    await gameManager.startRound(socket.currentGameCode);
    const updatedGame = await gameManager.getGame(socket.currentGameCode);
    io.to(socket.currentGameCode).emit('game_updated', updatedGame);
    io.to(socket.currentGameCode).emit('round_started', updatedGame);
  });

  socket.on('submit_answer', async (data) => {
    if (!socket.currentGameCode || !socket.playerId) return;

    await gameManager.submitAnswer(
      socket.currentGameCode,
      socket.playerId,
      data.category,
      data.answer
    );
    const game = await gameManager.getGame(socket.currentGameCode);
    io.to(socket.currentGameCode).emit('game_updated', game);
  });

  socket.on('finish_answers', async () => {
    if (!socket.currentGameCode || !socket.playerId) return;

    await gameManager.finishAnswers(socket.currentGameCode, socket.playerId);
    const game = await gameManager.getGame(socket.currentGameCode);
    io.to(socket.currentGameCode).emit('game_updated', game);

    if (game.status === 'reviewing') {
      io.to(socket.currentGameCode).emit('round_finished', game);
    }
  });

  socket.on('review_answer', async (data) => {
    if (!socket.currentGameCode || !socket.playerId) return;

    await gameManager.reviewAnswer(
      socket.currentGameCode,
      socket.playerId,
      data.reviewedPlayerId,
      data.category,
      data.isValid,
      data.isUnique
    );
    const game = await gameManager.getGame(socket.currentGameCode);
    io.to(socket.currentGameCode).emit('game_updated', game);
  });

  socket.on('ready_for_next_round', async () => {
    if (!socket.currentGameCode || !socket.playerId) return;

    await gameManager.markReadyForNextRound(socket.currentGameCode, socket.playerId);
    const game = await gameManager.getGame(socket.currentGameCode);
    io.to(socket.currentGameCode).emit('game_updated', game);

    if (game.allReadyForNextRound) {
      const result = await gameManager.prepareNextRound(socket.currentGameCode);
      const updatedGame = result || await gameManager.getGame(socket.currentGameCode);
      io.to(socket.currentGameCode).emit('game_updated', updatedGame);
      
      if (updatedGame.status === 'finished') {
        io.to(socket.currentGameCode).emit('game_finished', updatedGame);
      } else {
        io.to(socket.currentGameCode).emit('next_round_prepared', updatedGame);
      }
    }
  });

  socket.on('get_scores', async () => {
    if (!socket.currentGameCode) return;

    const scores = await gameManager.getScores(socket.currentGameCode);
    socket.emit('scores_updated', scores);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.currentGameCode) {
      io.to(socket.currentGameCode).emit('player_left', {
        playerId: socket.playerId
      });
    }
  });
});

setInterval(async () => {
  const allGames = await gameManager.getAllGames();
  allGames.forEach(({ gameCode, game }) => {
    if (game.status === 'playing' && game.timerEndTime && Date.now() >= game.timerEndTime) {
      game.status = 'reviewing';
      game.timerEndTime = null;
      io.to(gameCode).emit('game_updated', game);
      io.to(gameCode).emit('round_finished', game);
    }
  });
}, 1000);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
