const DataLoader = require('dataloader')
const con = require("../database/db");
const { simpleSortRows, allGeneric } = require('../helpers');
const cache = require('../config.js');

//load models
const UndergraduateStudent = require('../model/undergraduatestudent');
const Department = require('../model/department')


const getUndergraduateStudentSuperviosr = (superviosrIds) => {
	
	let query = con.select()
		.from('undergraduatestudent')
		.whereIn('advisor',superviosrIds);
		
	// A loader needs to return items in the correct order, this sorts them.
	return query.then(rows =>
		superviosrIds.map(nr =>
		  rows.filter(row => row.advisor == nr).map(row => new UndergraduateStudent(row))
		)
	  );
	
};

//undergraduate student is member of of department by depatment id
const getUndergraduateStudentMemberof = (memberIds) => {
	
 
	let query = con.select()
		.from('department')
		.whereIn('nr',memberIds);
		// A loader needs to return items in the correct order, this sorts them.
	return query.then(rows => simpleSortRows(rows, memberIds, Department));
	
};



//undergraduate student by id
const getUndergraduateStudentByIds = (undergraduateStudentIds) => {

	let query = con.select()
		.from('undergraduatestudent')
		.whereIn('nr',undergraduateStudentIds);
		// A loader needs to return items in the correct order, this sorts them.
	return query.then(rows =>
		undergraduateStudentIds.map(nr =>
			rows.filter(row => row.nr == nr).map(row => new UndergraduateStudent(row))
		)
		);
	
	
};



//get all Undergraduate students by uiversity Id
const getundergraduateStudentByUniversityId = (universityId) => {
	
	let query = con.select()
		.from('graduatestudent')
		.innerJoin('professor','professor.nr','=','graduatestudent.advisor')
		.whereIn('graduatestudent.undergraduatedegreefrom',universityId);
	// A loader needs to return items in the correct order, this sorts them.
	return query.then(rows =>
		universityId.map(nr =>
			rows.filter(row => row.undergraduatedegreefrom == nr).map(row => new UndergraduateStudent(row))
		)
	);	
    
};

const loaderUndergraduateStudentSuperviosrById = () => new DataLoader(getUndergraduateStudentSuperviosr, {cache});
const loaderUndergraduateStudentMemberofById = () => new DataLoader(getUndergraduateStudentMemberof, {cache});

const loaderUndergraduateStudentById = () => new DataLoader(getUndergraduateStudentByIds, {cache});
const loaderUndergetGraduateStudentByUniversityId = ()=> new DataLoader(getundergraduateStudentByUniversityId, {cache});




module.exports = {
	loaderUndergraduateStudentSuperviosrById,
	loaderUndergraduateStudentMemberofById,
	loaderUndergraduateStudentById,
	loaderUndergetGraduateStudentByUniversityId
}