USE categories_game;

INSERT INTO players (player_id, name) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Player1'),
('550e8400-e29b-41d4-a716-446655440001', 'Player2'),
('550e8400-e29b-41d4-a716-446655440002', 'Player3'),
('550e8400-e29b-41d4-a716-446655440003', 'Player4'),
('550e8400-e29b-41d4-a716-446655440004', 'Player5');

INSERT INTO games (game_code, creator_id, rounds, current_round, time_limit, status) VALUES
('ABC123', '550e8400-e29b-41d4-a716-446655440000', 6, 0, 10, 'waiting');

INSERT INTO game_categories (game_id, category_name, display_order) VALUES
(1, 'Country', 1),
(1, 'City', 2),
(1, 'Animal', 3),
(1, 'Name', 4),
(1, 'Thing', 5);

INSERT INTO game_players (game_id, player_id, is_ready, is_creator) VALUES
(1, '550e8400-e29b-41d4-a716-446655440000', FALSE, TRUE),
(1, '550e8400-e29b-41d4-a716-446655440001', FALSE, FALSE);
