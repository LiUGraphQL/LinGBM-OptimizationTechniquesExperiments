var connectioString = process.env.PG_CONNECTION_STRING;
var con = require('knex')({
  client: 'pg',
  connection: connectioString,
  searchPath: ['knex', 'public'],
});

if (con)
  console.log("Connected!");
else
  console.log("Database not connected! Connection Error");

module.exports = con