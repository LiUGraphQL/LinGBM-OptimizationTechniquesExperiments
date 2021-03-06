
// required modules
const DataLoader = require('dataloader')
const con = require("../database/db");
const { simpleSortRows, allGeneric } = require('../helpers');
const cache = require('../config.js');

// loads models
const University = require("../model/university");
const Department = require("../model/department");
const Professor = require("../model/professor");



// degree ["doctoral","master","undergraduate"]
const getDegreeFromById= (nrs) =>{
	let query = con
		.select()
		.from('university')
		.whereIn('nr',nrs);
	return query.then(rows => simpleSortRows(rows, nrs, University));
};

const getWorksFor = (nrs) => {
	let query = con.select()
		.from('department')
		.whereIn('nr',nrs);
	return query.then(rows => simpleSortRows(rows, nrs, Department));
};


// get Professor by id
const getProfessorById = (professorId) => {
	let query = con.select()
		.from("faculty")
		.innerJoin('professor','professor.nr' ,"=",'faculty.nr')
		//.whereIn('professor.nr',professorId);
		.whereIn('faculty.nr',professorId)
	return query.then(rows => rows.length > 0?
		professorId.map(nr =>
			rows.filter(row => row.nr == nr).map(row => new Professor(row))
		):[null]
	);
};

const professorLoaderDegreeFrom = () => new DataLoader(getDegreeFromById, {cache})
const professorLoaderWorkFor = () => new DataLoader(getWorksFor, {cache})
const loaderGetProfessorById = () => new DataLoader(getProfessorById, {cache})


module.exports = {
	professorLoaderDegreeFrom,
	professorLoaderWorkFor,
	loaderGetProfessorById

}

