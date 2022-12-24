/* Replace with your SQL commands */
CREATE TABLE IF NOT EXISTS user_table (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  -- email VARCHAR(255) UNIQUE NOT NULL,
  -- is_verified BOOLEAN default FALSE,
  -- is_locked BOOLEAN default FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- session table created by express-session PgStore
CREATE TABLE IF NOT EXISTS session (
  id BIGSERIAL PRIMARY KEY,
  sid VARCHAR(255) UNIQUE NOT NULL,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);

-- CREATE TABLE IF NOT EXISTS ticket_table (
--   id BIGSERIAL PRIMARY KEY,
--   created_user_id BIGINT NOT NULL,
--   status_id BIGINT NOT NULL,
--   comment TEXT NULL,
--   last_edited_user_id BIGINT NULL,
--   created_at TIMESTAMP DEFAULT NOW(),
--   updated_at TIMESTAMP DEFAULT NOW(),
--   FOREIGN KEY (created_user_id) REFERENCES user_table(id) ON DELETE SET NULL,
--   FOREIGN KEY (last_edited_user_id) REFERENCES user_table(id) ON DELETE SET NULL)
-- );

-- CREATE TABLE IF NOT EXISTS status_table (
--   id BIGSERIAL PRIMARY KEY,
--   created_user_id BIGINT NOT NULL,
--   title VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP DEFAULT NOW(),
--   updated_at TIMESTAMP DEFAULT NOW()
-- );

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

ALTER TABLE lyric_table ADD FOREIGN KEY (song_id) 
REFERENCES song_table(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION trigger_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql AS 
$$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER user_trigger_timestamp BEFORE UPDATE ON user_table
  FOR EACH ROW EXECUTE PROCEDURE trigger_updated_at();

CREATE TRIGGER lyric_trigger_timestamp BEFORE UPDATE ON lyric_table
  FOR EACH ROW EXECUTE PROCEDURE trigger_updated_at();

CREATE TRIGGER  song_trigger_timestamp BEFORE UPDATE ON song_table
  FOR EACH ROW EXECUTE PROCEDURE trigger_updated_at();
