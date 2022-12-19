/* Replace with your SQL commands */
DROP FUNCTION trigger_updated_at CASCADE;
DROP TRIGGER user_trigger_timestamp ON user_table CASCADE;
DROP TRIGGER lyric_trigger_timestamp ON lyric_table CASCADE;
DROP TRIGGER song_trigger_timestamp ON song_table CASCADE;
DROP TABLE user_table CASCADE;
DROP TABLE user_session_table;
DROP TABLE lyric_table CASCADE;
DROP TABLE song_table CASCADE;
