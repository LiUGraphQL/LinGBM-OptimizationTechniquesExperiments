const DataLoader = require('dataloader')
const con = require("../database/db");
const { simpleSortRows, allGeneric } = require('../helpers');
const cache = require('../config.js');

//load models
const GraduateStudent = require('../model/graduatestudent');
const Department = require('../model/department')
const Professor = require('../model/professor')


const getGraduateStudentSuperviosr = (superviosrIds) => {
	
	let query = con.select()
		.from('graduatestudent')
		.whereIn('advisor',superviosrIds);
	
	// A loader needs to return items in the correct order, this sorts them.
	return query.then(rows =>
		superviosrIds.map(nr =>
			rows.filter(row => row.advisor == nr).map(row => new GraduateStudent(row))
		)
	);	
};


const getGraduateStudentById = (keys) => {

	let query = con
		.select()
		.from('graduatestudent').whereIn('nr',keys);
		// A loader needs to return items in the correct order, this sorts them.
	return query.then(rows =>
		keys.map(nr =>
			rows.filter(row => row.nr == nr).map(row => new GraduateStudent(row))
		)
	);
    
};

//get all graduate students list
const getAllGraduateStudents = (keys) => {
	
	let query = con
		.select()
		.from('graduatestudent');
	// A loader needs to return items in the correct order, this sorts them.
    return query.then(rows => [rows.map(row => new GraduateStudent(row))]);
    
};

const getGraduateStudentByUniversityId = (universityId) => {
	
	let query = con.select()
		.from('graduatestudent')
		.whereIn('graduatestudent.undergraduatedegreefrom',universityId);
	return query.then(rows =>
		universityId.map(nr =>
			rows.filter(row => row.undergraduatedegreefrom == nr).map(row => new GraduateStudent(row))
		)
	);	
    
};

const getGraduateDepartmentsByid= (departmentIds) =>{
	let query = con
		.select()
		.from('graduatestudent')
		.whereIn('memberof',departmentIds);
	return query.then(rows => 
		departmentIds.map(nr =>
			rows.filter(row => row.memberof == nr).map(row =>  new GraduateStudent(row))
		)
	);
};

const getGraduateStudentByUniIdPlusAdvisor = (universityId) => {
	
	let query = con.select()
		.from('graduatestudent')
		.innerJoin('professor', 'professor.nr','=','graduatestudent.advisor')
		.whereIn('graduatestudent.undergraduatedegreefrom',universityId);
	return query.then(rows =>
		universityId.map(nr =>
			rows.filter(row => row.undergraduatedegreefrom == nr).map(row => new GraduateStudent(row))
		)
	);	
    
};




//get graduate student publication 
const getGraduateStudentPublication = (publicationId) => {
	
	let query = con.select().from('coauthorofpublication')
		.innerJoin('graduatestudent','graduatestudent.nr','=','coauthorofpublication.graduatestudentid')
		.whereIn('coauthorofpublication.publicationid',publicationId);
    // A loader needs to return items in the correct order, this sorts them.
	return query.then(rows => rows.length > 0?
		publicationId.map(nr =>
			rows.filter(row => row.publicationid == nr).map(row => new GraduateStudent(row))
		):[null]
	);
    
};

class graduateStudent{
	constructor(){
		this.GetGraduateStudentById = new DataLoader(getGraduateStudentById, {cache});
		this.GetAllGraduateStudents = new DataLoader(getAllGraduateStudents, {cache});
		this.GetGraduateStudentByUniversityId = new DataLoader(getGraduateStudentByUniversityId, {cache});
		this.GetGraduateStudentPublication = new DataLoader(getGraduateStudentPublication, {cache});
		this.GetGraduateDepartmentsByid = new DataLoader(getGraduateDepartmentsByid, {cache});
		this.GetGraduateStudentSuperviosr = new DataLoader(getGraduateStudentSuperviosr, {cache});
		this.GetGraduateStudentByUniIdPlusAdvisor = new DataLoader(getGraduateStudentByUniIdPlusAdvisor, {cache});
	}
	loaderGetGraduateStudentById(nr){
		return this.GetGraduateStudentById.load(nr);
	}
	loaderGetAllGraduateStudents(){
		return this.GetAllGraduateStudents.load('all');
	}
	loaderGetGraduateStudentByUniversityId(nr){
		return this.GetGraduateStudentByUniversityId.load(nr);
	}
	loaderGetGraduateStudentPublication(nr){
		return this.GetGraduateStudentPublication.load(nr);
	}
	loaderGetGraduateStudentDepartmentsById(nr){
		return this.GetGraduateDepartmentsByid.load(nr);
	}
	loaderGraduateStudentSuperviosrById(nr){
		return this.GetGraduateStudentSuperviosr.load(nr);
	}
	loadergetGraduateStudentByUniIdPlusAdvisor(nr){
		return this.GetGraduateStudentByUniIdPlusAdvisor.load(nr);
	}

}

module.exports = {
	graduateStudent
}