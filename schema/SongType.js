const { GraphQLObjectType, GraphQLString, GraphQLID } = require('graphql')
const axios = require('axios')

const SongType = (types) =>
  new GraphQLObjectType({
    name: 'SongType',
    fields: () => ({
      id: {
        type: GraphQLID
      },
      title: {
        type: GraphQLString
      },
      lyrics: {
        type: types.LyricType,
        resolve(parentValue) {
          return axios
            .get(`http://localhost:4000/lyric/${parentValue.id}`)
            .then((res) => res.data.data)
        }
      }
    })
  })

module.exports = SongType
