const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID
} = require('graphql')
const axios = require('axios')

const LyricType = (types) =>
  new GraphQLObjectType({
    name: 'LyricType',
    fields: () => ({
      id: {
        type: GraphQLID
      },
      likes: {
        type: GraphQLInt
      },
      content: {
        type: GraphQLString
      },
      song: {
        type: types.SongType,
        resolve(parentValue) {
          return axios
            .get(`http://localhost:4000/song/${parentValue.id}`)
            .then((res) => res.data.data)
        }
      }
    })
  })

module.exports = LyricType
