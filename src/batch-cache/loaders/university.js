const DataLoader = require('dataloader')
const con = require("../database/db");
const { simpleSortRows, allGeneric } = require('../helpers');
const cache = require('../config.js');

//load models
const University = require('../model/university');

const getUniversityById = (universityId) => {
	
	let query = con.select()
		.from('university')
		.whereIn('nr',universityId);
	
	// A loader needs to return items in the correct order, this sorts them.
	return query.then(rows => simpleSortRows(rows, universityId, University));
};


//const loaderGetUniversityById = () => new DataLoader(getUniversityById, {cache});
class loaderGetUniversityById{
	constructor(){
		this.GetUniversityById = new DataLoader(getUniversityById, {cache});
	}
	get(nr){
		return this.GetUniversityById.load(nr);
	}
}

module.exports = {
	loaderGetUniversityById
}
