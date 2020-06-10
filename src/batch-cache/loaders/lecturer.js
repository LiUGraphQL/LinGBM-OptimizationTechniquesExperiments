
// required modules
const DataLoader = require('dataloader')
const con = require("../database/db");
const { simpleSortRows, allGeneric } = require('../helpers');
const cache = require('../config.js');

// loads models
const University = require("../model/university");
const Department = require("../model/department");
const Lecturer = require("../model/lecturer");

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


// get lecturer by id
const getLecturerById = (lecturerId) => {
	let query = con.select()
		.from("faculty")
		.innerJoin('lecturer','lecturer.nr' ,"=",'faculty.nr')
		.whereIn('lecturer.nr',lecturerId);
	//return query.then(rows => simpleSortRows(rows, nrs, Department));
	return query.then(rows => rows.length > 0?
		lecturerId.map(nr =>
			rows.filter(row => row.nr == nr).map(row => new Lecturer(row))
		):[null]
	);
};

const lecturerLoaderDegreeFrom = () => new DataLoader(getDegreeFromById, {cache})
const lecturerLoaderWorkFor = () => new DataLoader(getWorksFor, {cache})
const loaderGetLecturerById = () => new DataLoader(getLecturerById, {cache})

//const lecturerLoaderMasterDegreeFrom = () => new DataLoader(getMasterDegreeFrom)
//const lecturerLoaderMasterDegreeFrom = () => new DataLoader(getMasterDegreeFrom)


module.exports = {
	lecturerLoaderDegreeFrom,
	lecturerLoaderWorkFor,
	loaderGetLecturerById

}

