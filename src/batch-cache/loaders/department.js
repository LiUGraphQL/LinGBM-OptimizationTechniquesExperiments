// required modules
const DataLoader = require('dataloader')
const con = require("../database/db");
const { simpleSortRows, allGeneric } = require('../helpers');
const cache = require('../config.js');

// loads models
const Department = require("../model/department");
const UndergraduateStudent = require("../model/undergraduatestudent");
const GraduateStudent = require("../model/graduatestudent");
const Professor = require("../model/professor");

const getDepartmentsBySuborganizationId= (suborganizationIds) =>{
	let query = con
		.select()
		.from('department')
		.whereIn('suborganizationof',suborganizationIds);
	return query.then(rows =>
		suborganizationIds.map(nr =>
			rows.filter(row => row.suborganizationof == nr).map(row => new Department(row))
		)
	);
};


const getDepartmentsByid= (nrs) =>{
	let query = con
		.select()
		.from('department')
		.whereIn('nr',nrs);
	return query.then(rows => simpleSortRows(rows, nrs, Department));
};


// undergraduate student of member of which department
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



// graduate student of member of which department
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


// get head of department 
const getHeadOfDepartment = (nrs) => {
	let query = con.select()
		.from("professor")
		.innerJoin('faculty','faculty.nr','=','professor.nr')
		.whereIn('professor.headof',nrs);
	return query.then(rows => rows.length > 0?
		nrs.map(nr =>
			rows.filter(row => row.headof == nr).map(row => new Professor(row))
		):[null]
	);
};


class loaderGetDepartmentsBySuborganizationId{
	constructor(){
		this.GetDepartmentsBySuborganizationId = new DataLoader(getDepartmentsBySuborganizationId, {cache});
	}
	get(nr){
		return this.GetDepartmentsBySuborganizationId.load(nr);
	}
}
//const loaderGetDepartmentsBySuborganizationId = () => new DataLoader(getDepartmentsBySuborganizationId, {cache})

class loaderGetDepartmentsById{
	constructor(){
		this.GetDepartmentsByid = new DataLoader(getDepartmentsByid, {cache});
	}
	get(nr){
		return this.GetDepartmentsByid.load(nr);
	}
}
//const loaderGetDepartmentsById = () => new DataLoader(getDepartmentsByid, {cache})

class loaderGetUndergraduateStudentDepartmentsById{
	constructor(){
		this.GetUndergraduateDepartmentsByid = new DataLoader(getUndergraduateDepartmentsByid, {cache});
	}
	get(nr){
		return this.GetUndergraduateDepartmentsByid.load(nr);
	}
}
//const loaderGetUndergraduateStudentDepartmentsById = () => new DataLoader(getUndergraduateDepartmentsByid, {cache})

class loaderGetGraduateStudentDepartmentsById{
	constructor(){
		this.GetGraduateDepartmentsByid = new DataLoader(getGraduateDepartmentsByid, {cache});
	}
	get(nr){
		return this.GetGraduateDepartmentsByid.load(nr);
	}
}
//const loaderGetGraduateStudentDepartmentsById = () => new DataLoader(getGraduateDepartmentsByid, {cache})

class loaderGetHeadOfDepartment{
	constructor(){
		this.GetHeadOfDepartment = new DataLoader(getHeadOfDepartment, {cache});
	}
	get(nr){
		return this.GetHeadOfDepartment.load(nr);
	}
}
//const loaderGetHeadOfDepartment = () => new DataLoader(getHeadOfDepartment, {cache})



module.exports={
	loaderGetDepartmentsBySuborganizationId,
	loaderGetDepartmentsById,
	loaderGetUndergraduateStudentDepartmentsById,
	loaderGetGraduateStudentDepartmentsById,
	loaderGetHeadOfDepartment
}