const con = require("./database/db");

const getGeneric = async (nr, model, databaseTable) => {
  return con
    .select()
    .from(databaseTable)
    .where("nr", nr)
    .first()
    .then(response => new model(response));
};

const allGeneric = async (model, databaseTable) => {
  return con
    .select()
    .from(databaseTable)
    .then(response => response.map(raw => new model(raw)));
};

const simpleSortRows = (rows, nrs, model) => {
    
  return nrs.map(nr => {
    return new model(rows.find(row => row.nr == nr));
  });
};


module.exports = {
    getGeneric,
    allGeneric,
    simpleSortRows
}