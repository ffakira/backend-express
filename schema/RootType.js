const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLNonNull,
  GraphQLList
} = require('graphql')
const axios = require('axios')

const {
  SongType,
  LyricType
} = require('./types')

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: () => ({
    songs: {
      type: new GraphQLList(SongType),
      resolve () {
        return axios.get('http://localhost:4000/songs')
          .then(res => res.data.data)
      }
    },
    song: {
      type: SongType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      resolve (_, { id }) {
        return axios.get(`http://localhost:4000/song/${id}`)
          .then(res => res.data.data)
      }
    },
    lyric: {
      type: LyricType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      resolve (_, { id }) {
        return axios.get(`http://localhost:4000/lyric/${id}`)
          .then(res => res.data.data)
      }
    }
  })
})

module.exports = RootQuery
