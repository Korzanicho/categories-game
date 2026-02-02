import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

export interface Game {
  gameCode: string;
  creatorId: string;
  rounds: number;
  currentRound: number;
  timeLimit: number;
  categories: string[];
  status: 'waiting' | 'letter_selection' | 'playing' | 'reviewing' | 'finished';
  players: string[];
  playerNames: Record<string, string>;
  playerReady: Record<string, boolean>;
  currentLetter: string | null;
  currentLetterSelector: string | null;
  answers: Record<string, Record<string, string>>;
  reviews: Record<string, Record<string, Record<string, { isValid: boolean | null; isUnique: boolean | null }>>>;
  scores: Record<string, number>;
  roundReady: Record<string, boolean>;
  allReadyForNextRound: boolean;
  finishedPlayers: string[];
  timerEndTime: number | null;
  timerStartedBy: string | null;
}

interface GameStore {
  socket: Socket | null;
  playerId: string | null;
  playerName: string;
  game: Game | null;
  scores: {
    scores: Record<string, number>;
    players: string[];
    currentRound: number;
    totalRounds: number;
    isFinished: boolean;
  } | null;
  initializeSocket: () => void;
  createPlayer: (name?: string) => void;
  createGame: (rounds: number, categories: string[], timeLimit: number) => void;
  joinGame: (gameCode: string) => void;
  toggleReady: () => void;
  startGame: () => void;
  randomizeLetter: () => void;
  startRound: () => void;
  submitAnswer: (category: string, answer: string) => void;
  finishAnswers: () => void;
  reviewAnswer: (reviewedPlayerId: string, category: string, isValid: boolean | null, isUnique: boolean | null) => void;
  readyForNextRound: () => void;
  getScores: () => void;
  setPlayerName: (name: string) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  socket: null,
  playerId: null,
  playerName: '',
  game: null,
  scores: null,

  initializeSocket: () => {
    const serverUrl = import.meta.env.VITE_SERVER_URL || 
      (window.location.protocol === 'https:' 
        ? 'https://panstwa-miasta.webkor.pl' 
        : 'http://localhost:3003');
    const socket = io(serverUrl);
    
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('player_created', (data: { playerId: string; playerName: string }) => {
      set({ playerId: data.playerId, playerName: data.playerName });
    });

    socket.on('game_created', (data: { gameCode: string; game: Game }) => {
      set({ game: data.game });
    });

    socket.on('game_joined', (game: Game) => {
      set({ game });
    });

    socket.on('game_updated', (game: Game) => {
      set({ game });
    });

    socket.on('game_started', (game: Game) => {
      set({ game });
    });

    socket.on('letter_selected', (data: { letter: string; game: Game }) => {
      set({ game: data.game });
    });

    socket.on('round_started', (game: Game) => {
      set({ game });
    });

    socket.on('round_finished', (game: Game) => {
      set({ game });
    });

    socket.on('next_round_prepared', (game: Game) => {
      set({ game });
    });

    socket.on('game_finished', (game: Game) => {
      set({ game });
    });

    socket.on('scores_updated', (scores: any) => {
      set({ scores });
    });

    socket.on('player_removed', (data: { playerId: string; reason: string }) => {
      const { playerId: currentPlayerId } = get();
      if (data.playerId === currentPlayerId) {
        set({ game: null });
        window.location.href = '/';
      }
    });

    socket.on('error', (data: { message: string }) => {
      alert(data.message);
    });

    set({ socket });
    
    socket.emit('create_player', {});
  },

  createPlayer: (name?: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('create_player', { name });
    }
  },

  createGame: (rounds: number, categories: string[], timeLimit: number) => {
    const { socket } = get();
    if (socket) {
      socket.emit('create_game', { rounds, categories, timeLimit });
    }
  },

  joinGame: (gameCode: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('join_game', { gameCode });
    }
  },

  toggleReady: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('toggle_ready');
    }
  },

  startGame: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('start_game');
    }
  },

  randomizeLetter: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('randomize_letter');
    }
  },

  startRound: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('start_round');
    }
  },

  submitAnswer: (category: string, answer: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('submit_answer', { category, answer });
    }
  },

  finishAnswers: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('finish_answers');
    }
  },

  reviewAnswer: (reviewedPlayerId: string, category: string, isValid: boolean | null, isUnique: boolean | null) => {
    const { socket } = get();
    if (socket) {
      socket.emit('review_answer', { reviewedPlayerId, category, isValid, isUnique });
    }
  },

  readyForNextRound: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('ready_for_next_round');
    }
  },

  getScores: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('get_scores');
    }
  },

  setPlayerName: (name: string) => {
    set({ playerName: name });
    const { socket } = get();
    if (socket) {
      socket.emit('create_player', { name });
    }
  },
}));
