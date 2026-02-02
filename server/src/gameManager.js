import { v4 as uuidv4 } from 'uuid';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export class GameManager {
  constructor() {
    this.games = new Map();
  }

  async createGame({ gameCode, creatorId, rounds, timeLimit, categories }) {
    const game = {
      gameCode,
      creatorId,
      rounds: parseInt(rounds),
      currentRound: 0,
      timeLimit: parseInt(timeLimit),
      categories: categories || [],
      status: 'waiting',
      players: [creatorId],
      playerNames: {},
      playerReady: { [creatorId]: false },
      currentLetter: null,
      currentLetterSelector: null,
      answers: { [creatorId]: {} },
      reviews: { [creatorId]: {} },
      scores: { [creatorId]: 0 },
      roundReady: { [creatorId]: false },
      allReadyForNextRound: false,
      finishedPlayers: [],
      timerEndTime: null,
      timerStartedBy: null
    };

    this.games.set(gameCode, game);
    return game;
  }

  async getGame(gameCode) {
    return this.games.get(gameCode) || null;
  }

  async addPlayer(gameCode, playerId, playerName) {
    const game = this.games.get(gameCode);
    if (!game) return null;

    if (!game.players.includes(playerId)) {
      game.players.push(playerId);
      game.playerReady[playerId] = false;
      game.roundReady[playerId] = false;
      game.scores[playerId] = 0;
      game.answers[playerId] = {};
      game.reviews[playerId] = {};
    }
    
    if (playerName) {
      game.playerNames[playerId] = playerName;
    }

    return game;
  }

  async toggleReady(gameCode, playerId) {
    const game = this.games.get(gameCode);
    if (!game) return null;

    if (game.playerReady[playerId] !== undefined) {
      game.playerReady[playerId] = !game.playerReady[playerId];
    }

    return game;
  }

  async startGame(gameCode) {
    const game = this.games.get(gameCode);
    if (!game) return null;

    const otherPlayersReady = game.players.filter(p => p !== game.creatorId && game.playerReady[p] === true);
    if (otherPlayersReady.length < 1) {
      throw new Error('At least one other player must be ready');
    }

    const playersToKeep = [game.creatorId, ...otherPlayersReady];
    const playersToRemove = game.players.filter(p => !playersToKeep.includes(p));

    game.players = playersToKeep;
    playersToRemove.forEach(playerId => {
      delete game.playerReady[playerId];
      delete game.roundReady[playerId];
      delete game.scores[playerId];
      delete game.answers[playerId];
      delete game.reviews[playerId];
    });

    game.status = 'letter_selection';
    game.currentRound = 1;
    game.currentLetterSelector = game.creatorId;

    return { game, removedPlayers: playersToRemove };
  }

  async selectLetter(gameCode, letter) {
    const game = this.games.get(gameCode);
    if (!game) return null;

    if (!ALPHABET.includes(letter.toUpperCase())) {
      throw new Error('Invalid letter');
    }

    game.currentLetter = letter.toUpperCase();
    return game;
  }

  async startRound(gameCode) {
    const game = this.games.get(gameCode);
    if (!game) return null;

    game.status = 'playing';
    game.answers = {};
    game.finishedPlayers = [];
    game.timerEndTime = null;
    game.timerStartedBy = null;
    game.roundReady = {};
    game.allReadyForNextRound = false;

    game.players.forEach(playerId => {
      game.answers[playerId] = {};
    });

    return game;
  }

  async submitAnswer(gameCode, playerId, category, answer) {
    const game = this.games.get(gameCode);
    if (!game) return null;

    if (!game.answers[playerId]) {
      game.answers[playerId] = {};
    }

    game.answers[playerId][category] = answer.trim();
    return game;
  }

  async finishAnswers(gameCode, playerId) {
    const game = this.games.get(gameCode);
    if (!game) return null;

    if (!game.finishedPlayers.includes(playerId)) {
      game.finishedPlayers.push(playerId);
    }

    if (game.finishedPlayers.length === 1) {
      game.timerEndTime = Date.now() + (game.timeLimit * 1000);
      game.timerStartedBy = playerId;
    }

    if (game.finishedPlayers.length === game.players.length) {
      game.status = 'reviewing';
      game.timerEndTime = null;
    }

    return game;
  }

  async reviewAnswer(gameCode, reviewerId, reviewedPlayerId, category, isValid, isUnique) {
    const game = this.games.get(gameCode);
    if (!game) return null;

    if (!game.reviews[reviewerId]) {
      game.reviews[reviewerId] = {};
    }
    if (!game.reviews[reviewerId][reviewedPlayerId]) {
      game.reviews[reviewerId][reviewedPlayerId] = {};
    }

    game.reviews[reviewerId][reviewedPlayerId][category] = {
      isValid,
      isUnique
    };

    return game;
  }

  async markReadyForNextRound(gameCode, playerId) {
    const game = this.games.get(gameCode);
    if (!game) return null;

    game.roundReady[playerId] = true;

    const allReady = game.players.every(p => game.roundReady[p] === true);
    game.allReadyForNextRound = allReady;

    return game;
  }

  async prepareNextRound(gameCode) {
    const game = this.games.get(gameCode);
    if (!game) return null;

    this.calculateRoundScores(game);

    game.answers = {};
    game.reviews = {};
    game.finishedPlayers = [];
    game.roundReady = {};
    game.allReadyForNextRound = false;

    if (game.currentRound >= game.rounds) {
      game.status = 'finished';
      return game;
    }

    game.currentRound++;
    game.status = 'letter_selection';

    const currentIndex = game.players.indexOf(game.currentLetterSelector);
    const nextIndex = (currentIndex + 1) % game.players.length;
    game.currentLetterSelector = game.players[nextIndex];
    game.currentLetter = null;

    return game;
  }

  calculateRoundScores(game) {
    const categoryScores = {};

    Object.keys(game.reviews).forEach(reviewerId => {
      Object.keys(game.reviews[reviewerId]).forEach(reviewedPlayerId => {
        if (reviewedPlayerId === reviewerId) return;

        Object.keys(game.reviews[reviewerId][reviewedPlayerId]).forEach(category => {
          const review = game.reviews[reviewerId][reviewedPlayerId][category];
          
          if (!categoryScores[category]) {
            categoryScores[category] = {};
          }
          if (!categoryScores[category][reviewedPlayerId]) {
            categoryScores[category][reviewedPlayerId] = { valid: 0, unique: 0 };
          }

          if (review.isValid) {
            categoryScores[category][reviewedPlayerId].valid++;
          }
          if (review.isUnique) {
            categoryScores[category][reviewedPlayerId].unique++;
          }
        });
      });
    });

    game.players.forEach(playerId => {
      game.categories.forEach(category => {
        const answer = game.answers[playerId]?.[category];
        
        if (!answer || answer.trim() === '') {
          return;
        }

        const scores = categoryScores[category]?.[playerId];
        if (!scores) {
          return;
        }

        const totalPlayers = game.players.length - 1;
        const majority = Math.ceil(totalPlayers / 2);

        let points = 0;
        if (scores.valid >= majority) {
          points = 5;
          if (scores.unique >= majority) {
            points = 10;
          }
        }

        if (!game.scores[playerId]) {
          game.scores[playerId] = 0;
        }
        game.scores[playerId] += points;
      });
    });
  }

  async getScores(gameCode) {
    const game = this.games.get(gameCode);
    if (!game) return null;

    return {
      scores: game.scores,
      players: game.players,
      currentRound: game.currentRound,
      totalRounds: game.rounds,
      isFinished: game.status === 'finished'
    };
  }

  async getAllGames() {
    const result = [];
    this.games.forEach((game, gameCode) => {
      result.push({ gameCode, game });
    });
    return result;
  }
}
