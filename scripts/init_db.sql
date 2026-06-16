CREATE TABLE entries (
  sequence INTEGER PRIMARY KEY,
  term TEXT NOT NULL,
  reading TEXT NOT NULL,
  pos TEXT NOT NULL,
  score INTEGER,
  tags TEXT,
  definitions TEXT,
  notes TEXT,
  forms TEXT
);

INSERT INTO entries (sequence, term, reading, pos, score, tags, definitions, notes, forms) VALUES
(1, '行く', 'いく', 'v5k vi', 100, '⭐ ichi1', '["to go", "to move", "to proceed"]', '[]', '[]'),
(2, '生きる', 'いきる', 'v1 vi', 95, '⭐ ichi1', '["to live", "to exist", "to survive"]', '[]', '[]'),
(3, '忘れる', 'わすれる', 'v1 vt', 90, '⭐ ichi1', '["to forget", "to leave behind"]', '[]', '[]'),
(4, '来る', 'くる', 'vk vi', 99, '⭐ ichi1', '["to come", "to arrive"]', '[]', '[]'),
(5, 'する', 'する', 'vs vt', 100, '⭐ ichi1', '["to do", "to make", "to perform"]', '[]', '[]'),
(6, '勉強する', 'べんきょうする', 'vs vi', 85, '⭐ ichi1', '["to study"]', '[]', '[]'),
(7, '美しい', 'うつくしい', 'adj-i', 80, '⭐ ichi1', '["beautiful", "lovely", "pretty"]', '[]', '[]'),
(8, '寒い', 'さむい', 'adj-i', 75, '⭐ ichi1', '["cold (weather)", "chilly"]', '[]', '[]'),
(9, '話す', 'はなす', 'v5s vt', 90, '⭐ ichi1', '["to talk", "to speak", "to tell"]', '[]', '[]'),
(10, '待つ', 'まつ', 'v5t vt', 88, '⭐ ichi1', '["to wait"]', '[]', '[]'),
(11, '飲む', 'のむ', 'v5m vt', 87, '⭐ ichi1', '["to drink", "to gulp"]', '[]', '[]'),
(12, '泳ぐ', 'およぐ', 'v5g vi', 70, '⭐ ichi1', '["to swim"]', '[]', '[]'),
(13, '死ぬ', 'しぬ', 'v5n vi', 60, '⭐ ichi1', '["to die", "to pass away"]', '[]', '[]'),
(14, '買う', 'かう', 'v5w vt', 89, '⭐ ichi1', '["to buy", "to purchase"]', '[]', '[]'),
(15, '走る', 'はしる', 'v5r vi', 80, '⭐ ichi1', '["to run"]', '[]', '[]'),
(16, '遊ぶ', 'あそぶ', 'v5b vi', 82, '⭐ ichi1', '["to play", "to enjoy oneself"]', '[]', '[]');
