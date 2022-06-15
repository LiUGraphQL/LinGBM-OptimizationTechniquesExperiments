const DataLoader = require('dataloader')
const con = require("../database/db");
const { simpleSortRows, allGeneric } = require('../helpers');
const cache = require('../config.js');


// load models
const Publication = require('../model/publication');

// get publications by authorId
const getPublicationsByAuthorId = (authorIds) => {

	let query = con.select()
		.from('publication')
		.whereIn('mainauthor',authorIds);
	// A loader needs to return items in the correct order, this sorts them.
	return query.then(rows =>
		authorIds.map(nr =>
			rows.filter(row => row.mainauthor == nr).map(row => new Publication(row))
		)
	);
		
};


// get publications by authorId
const getAllPublications = (keys) => {

	let query = con.select()
		.from('publication')
	return query.then(rows => [rows.map(row => new Publication(row))]);
};


const loaderGetPublicationByAuthorId = () => new DataLoader(getPublicationsByAuthorId, {cache})
const loaderGetAllPublications = () => new DataLoader(getAllPublications, {cache})


module.exports = {
	loaderGetPublicationByAuthorId,
	loaderGetAllPublications
}