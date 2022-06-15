///dotenv use to include .env file which is created on root file
require('dotenv').config();

const { ApolloServer } = require("apollo-server");

const resolvers = require("./resolver");
const typeDefs = require("./typeDefs");
const context = require("./context");

const server = new ApolloServer({ 
	typeDefs,
	resolvers,
	tracing: true,
	context: () => {
		return context();
	}
});

server.listen().then(({ url }) => {
	console.log(`🚀 Server ready at ${url}`);
});



