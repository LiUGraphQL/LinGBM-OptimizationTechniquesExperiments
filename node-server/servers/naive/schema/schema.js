const { gql } = require("apollo-server");
const fs = require('fs');

var path = require('path');
// get a root path of application
var appDir = path.dirname(require.main.filename);


const schemaString = fs.readFileSync(appDir+'/resources/apischema.graphql', 'utf8');



const typeDefs = gql`${schemaString}`;


module.exports = typeDefs;
