/** @dev due to how circular depedencies work with require */
const LyricTypeInject = require('./LyricType')
const SongTypeInject = require('./SongType')

const types = {}
types.LyricType = LyricTypeInject(types)
types.SongType = SongTypeInject(types)

const LyricType = types.LyricType
const SongType = types.SongType

module.exports = {
  LyricType,
  SongType
}
