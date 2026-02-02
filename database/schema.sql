CREATE DATABASE IF NOT EXISTS categories_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE categories_game;

CREATE TABLE IF NOT EXISTS players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id VARCHAR(36) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_player_id (player_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_code VARCHAR(6) UNIQUE NOT NULL,
    creator_id VARCHAR(36) NOT NULL,
    rounds INT NOT NULL DEFAULT 6,
    current_round INT NOT NULL DEFAULT 0,
    time_limit INT NOT NULL DEFAULT 10,
    status ENUM('waiting', 'letter_selection', 'playing', 'reviewing', 'finished') NOT NULL DEFAULT 'waiting',
    current_letter VARCHAR(1) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_game_code (game_code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS game_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    display_order INT NOT NULL,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    INDEX idx_game_id (game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS game_players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    player_id VARCHAR(36) NOT NULL,
    is_ready BOOLEAN DEFAULT FALSE,
    is_creator BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    UNIQUE KEY unique_game_player (game_id, player_id),
    INDEX idx_game_id (game_id),
    INDEX idx_player_id (player_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS player_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    player_id VARCHAR(36) NOT NULL,
    round_number INT NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    answer TEXT,
    letter VARCHAR(1) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    UNIQUE KEY unique_answer (game_id, player_id, round_number, category_name),
    INDEX idx_game_round (game_id, round_number),
    INDEX idx_player_round (player_id, round_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS answer_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    round_number INT NOT NULL,
    reviewer_id VARCHAR(36) NOT NULL,
    reviewed_player_id VARCHAR(36) NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    is_valid BOOLEAN DEFAULT NULL,
    is_unique BOOLEAN DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review (game_id, round_number, reviewer_id, reviewed_player_id, category_name),
    INDEX idx_game_round (game_id, round_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS player_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    player_id VARCHAR(36) NOT NULL,
    round_number INT NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    points INT NOT NULL DEFAULT 0,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    UNIQUE KEY unique_score (game_id, player_id, round_number, category_name),
    INDEX idx_game_player (game_id, player_id),
    INDEX idx_game_round (game_id, round_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
