
// required modules
const DataLoader = require('dataloader')
const con = require("../database/db");
const { simpleSortRows, allGeneric } = require('../helpers');
const cache = require('../config.js');

// loads models
const University = require("../model/university");
const Department = require("../model/department");
const Professor = require("../model/professor");



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

const getProfessorByDepartmentId = (worksFor) =>{
	let query = con.select()
		.from("faculty")
		.innerJoin('professor','professor.nr','=','faculty.nr')
		.whereIn('faculty.worksfor',worksFor);
	
	return query.then(rows =>
		worksFor.map(nr =>
			rows.filter(row => row.worksfor == nr).map(row => new Professor(row))
		)
	);
};

class professor{
	constructor(){
		this.GetProfessorById = new DataLoader(getProfessorById, {cache});
		this.GetProfessorByDepartmentId = new DataLoader(getProfessorByDepartmentId, {cache});
	}
	loaderGetProfessorById(nr){
		return this.GetProfessorById.load(nr);
	}
	loaderGetProfessorByDepartmentId(nr){
		return this.GetProfessorByDepartmentId.load(nr);
	}
}

module.exports = {
	professor
}

