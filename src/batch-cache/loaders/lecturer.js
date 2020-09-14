// required modules
const DataLoader = require('dataloader')
const con = require("../database/db");
const { simpleSortRows, allGeneric } = require('../helpers');
const cache = require('../config.js');

// loads models
const University = require("../model/university");
const Department = require("../model/department");
const Lecturer = require("../model/lecturer");


const getWorksFor = (nrs) => {
	let query = con.select()
		.from('department')
		.whereIn('nr',nrs);
	return query.then(rows => simpleSortRows(rows, nrs, Department));
};

const getLecturerByDepartmentId = (worksFor) =>{
	let query = con.select()
		.from("faculty")
		.innerJoin('lecturer','lecturer.nr','=','faculty.nr')
		.whereIn('faculty.worksfor',worksFor);
	
	return query.then(rows =>
		worksFor.map(nr =>
			rows.filter(row => row.worksfor == nr).map(row => new Lecturer(row))
		)
	);
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


class lecturer{
	constructor(){
		this.GetWorksFor = new DataLoader(getWorksFor, {cache});
		this.GetLecturerById = new DataLoader(getLecturerById, {cache});
		this.GetLecturerByDepartmentId = new DataLoader(getLecturerByDepartmentId, {cache});
	}
	lecturerLoaderWorkFor(nr){
		return this.GetWorksFor.load(nr);
	}
	loaderGetLecturerById(nr){
		return this.GetLecturerById.load(nr);
	}
	loaderGetLecturerByDepartmentId(nr){
		return this.GetLecturerByDepartmentId.load(nr);
	}
}

module.exports = {
	lecturer
}

