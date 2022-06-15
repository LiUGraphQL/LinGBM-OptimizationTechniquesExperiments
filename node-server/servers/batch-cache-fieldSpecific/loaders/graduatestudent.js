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



//graduate student is member of 
const getGraduateStudentMemberof = (memberIds) => {
	
    let query = con.select()
        .from('department')
        .whereIn('nr',memberIds);
        // A loader needs to return items in the correct order, this sorts them.
    return query.then(rows => simpleSortRows(rows, memberIds, Department));
    
};


//graduate student advisor
const getGraduateStudentAdvisor = (advisorIds) => {
	
	let query = con.select()
		.from("faculty")
		.innerJoin('professor','professor.nr' ,"=",'faculty.nr')
		.whereIn('professor.nr',advisorIds);
        // A loader needs to return items in the correct order, this sorts them.
    return query.then(rows => simpleSortRows(rows, advisorIds, Professor));
    
};

//get all graduate students list
const getAllGraduateStudents = (keys) => {
	
	let query = con
		.select()
		.from('graduatestudent');
	// A loader needs to return items in the correct order, this sorts them.
    return query.then(rows => [rows.map(row => new GraduateStudent(row))]);
    
};


//get all graduate students byId
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



//get all graduate students by uiversity Id
/*
const getGraduateStudentByUniversityId = (universityId) => {
	
	let query = con.select()
		.from('department')
		.innerJoin('undergraduatestudent','undergraduatestudent.memberof','=','department.nr')
		.whereIn('department.nr',universityId);

	// A loader needs to return items in the correct order, this sorts them.
    // A loader needs to return items in the correct order, this sorts them.
	return query.then(rows =>
		universityId.map(nr =>
			rows.filter(row => row.nr == nr).map(row => new GraduateStudent(row))
		)
	);	
    
};
*/
const getGraduateStudentByUniversityId = (universityId) => {
	
	let query = con.select()
		.from('graduatestudent')
		.whereIn('graduatestudent.undergraduatedegreefrom',universityId);
	// A loader needs to return items in the correct order, this sorts them.
    // A loader needs to return items in the correct order, this sorts them.
	return query.then(rows =>
		universityId.map(nr =>
			rows.filter(row => row.undergraduatedegreefrom == nr).map(row => new GraduateStudent(row))
		)
	);	
    
};

const getGraduateStudentByUniIdPlusAdvisor = (universityId) => {
	
	let query = con.select()
		.from('graduatestudent')
		.innerJoin('professor', 'professor.nr','=','graduatestudent.advisor')
		.whereIn('graduatestudent.undergraduatedegreefrom',universityId);
	// A loader needs to return items in the correct order, this sorts them.
    // A loader needs to return items in the correct order, this sorts them.
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



const loaderGraduateStudentSuperviosrById = () => new DataLoader(getGraduateStudentSuperviosr, {cache});
const loaderGraduateStudentMemberofById = () => new DataLoader(getGraduateStudentMemberof, {cache});
const loaderGraduateStudentAdvisorById = () => new DataLoader(getGraduateStudentAdvisor, {cache});
const loaderGetAllGraduateStudents = () => new DataLoader(getAllGraduateStudents, {cache});
const loaderGetGraduateStudentById = () => new DataLoader(getGraduateStudentById, {cache});
const loaderGetGraduateStudentByUniversityId = ()=> new DataLoader(getGraduateStudentByUniversityId, {cache});
const loaderGetGraduateStudentPublication = ()=> new DataLoader(getGraduateStudentPublication, {cache});
const loadergetGraduateStudentByUniIdPlusAdvisor = () => new DataLoader(getGraduateStudentByUniIdPlusAdvisor, {cache});

module.exports = {
	loaderGraduateStudentSuperviosrById,
	loaderGraduateStudentMemberofById,
	loaderGraduateStudentAdvisorById,
	loaderGetAllGraduateStudents,
	loaderGetGraduateStudentById,
	loaderGetGraduateStudentByUniversityId,
	loaderGetGraduateStudentPublication,
	loadergetGraduateStudentByUniIdPlusAdvisor

}