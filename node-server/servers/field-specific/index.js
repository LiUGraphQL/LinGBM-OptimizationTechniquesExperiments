///dotenv use to include .env file which is created on root file
require('dotenv').config();

const { ApolloServer } = require("apollo-server");

const resolvers = require("./resolver");
const typeDefs = require("./typeDefs");

const server = new ApolloServer({ 
	typeDefs,
	resolvers,
	tracing: true 
});

server.listen().then(({ url }) => {
	console.log(`🚀 Server ready at ${url}`);
});



