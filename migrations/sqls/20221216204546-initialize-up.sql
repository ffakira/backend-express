/* Replace with your SQL commands */
CREATE TABLE IF NOT EXISTS user_table (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lyric_table (
  id BIGSERIAL PRIMARY KEY,
  likes BIGINT DEFAULT 0,
  content TEXT NULL,
  song_id BIGINT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS song_table (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  user_id BIGINT NULL,
  lyric_id BIGINT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES user_table(id) ON DELETE SET NULL,
  FOREIGN KEY (lyric_id) REFERENCES lyric_table(id) ON DELETE SET NULL
);

ALTER TABLE lyric_table ADD FOREIGN KEY (song_id) REFERENCES song_table(id) ON DELETE SET NULL;