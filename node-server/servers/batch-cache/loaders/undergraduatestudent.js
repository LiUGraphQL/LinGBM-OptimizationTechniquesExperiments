const DataLoader = require('dataloader')
const con = require("../database/db");
const { simpleSortRows, allGeneric } = require('../helpers');
const cache = require('../config.js');

//load models
const UndergraduateStudent = require('../model/undergraduatestudent');
const Department = require('../model/department')

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

const getUndergraduateDepartmentsByid= (departmentIds) =>{
	let query = con
		.select()
		.from('undergraduatestudent')
		.whereIn('memberof',departmentIds);
	return query.then(rows =>
		departmentIds.map(nr =>
			rows.filter(row => row.memberof == nr).map(row => new UndergraduateStudent(row))
		)
	);
};

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


class undergraduateStudent{
	constructor(){
		this.GetUndergraduateDepartmentsByid = new DataLoader(getUndergraduateDepartmentsByid, {cache});
		this.GetUndergraduateStudentSuperviosr = new DataLoader(getUndergraduateStudentSuperviosr, {cache});
		this.GetUndergraduateStudentByIds = new DataLoader(getUndergraduateStudentByIds, {cache});
		this.GetundergraduateStudentByUniversityId = new DataLoader(getundergraduateStudentByUniversityId, {cache});
	}
	loaderGetUndergraduateStudentDepartmentsById(nr){
		return this.GetUndergraduateDepartmentsByid.load(nr);
	}
	loaderUndergraduateStudentSuperviosrById(nr){
		return this.GetUndergraduateStudentSuperviosr.load(nr);
	}
	loaderUndergraduateStudentById(nr){
		return this.GetUndergraduateStudentByIds.load(nr);
	}
	loaderUndergetGraduateStudentByUniversityId(nr){
		return this.GetundergraduateStudentByUniversityId.load(nr);
	}

}

module.exports = {
	undergraduateStudent
}