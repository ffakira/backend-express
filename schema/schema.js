const { GraphQLSchema } = require('graphql')

const RootQuery = require('./RootType')

module.exports = new GraphQLSchema({
  query: RootQuery
})
