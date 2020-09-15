// required modules
const _ = require("lodash");
const con = require("../database/db");
const { simpleSortRows, allGeneric, memoize } = require('../helpers');

var rp = require('request-promise');
const DataLoader = require('dataloader')
const cache =  require("../config")

// loads models
const Fa = require("../model/faculty");
const RG = require("../model/researchGroup");
const University = require("../model/university");
const Lecturer = require("../model/lecturer");
const GraduateCourse = require("../model/graduatecourse");
const GraduateStudent = require("../model/graduatestudent");
const UndergraduateCourses = require('../model/undergraduatecourse');
const UndergraduateStudent = require('../model/undergraduatestudent');
const Publication = require('../model/publication');
const Author = require('../model/author');
const Department = require('../model/department');
const Professor = require('../model/professor')
const UndergraduateTakeCourses  =require('../model/undergraduatestudenttakecourse')
const GradudateCourse = require('../model/graduatecourse');

const getFacultyById = (facultyId) =>{
	let query = con.select().from('faculty').where('nr',facultyId);
	let result = query.then(rows => rows.map(row => new Fa(row)));
	return result;
}

const getFacultyLecturer = facultyId => {
	let query = con.select().from("faculty").innerJoin('lecturer','lecturer.nr' ,"=",'faculty.nr').where('faculty.nr',facultyId);
	
	return query.then(rows => (rows.length >0) ? new Lecturer(rows[0]):null);
};

const getFacultyProfessor = facultyId => {
	let query = con.select().from("faculty").innerJoin('professor','professor.nr' ,"=",'faculty.nr').where('faculty.nr',facultyId);
	 return query.then(rows => (rows.length >0) ? new Professor(rows[0]):null);
};

const getDoctoralDegreeById = (id) =>{
	let query = con.select().from('faculty').where('doctoraldegreefrom',id);
	let result = query.then(rows => rows.map(row => new Fa(row)));
	return result;
	
}

const getDoctoralDegreeByWorkFor = (id,worksFor) =>{
	let query  = con.select().from('faculty').where('doctoraldegreefrom',id).andWhere('worksfor',parseInt(worksFor));
	let result = query.then(rows => rows.map(row => new Fa(row)));
	return result;
}

const getFacultybyDepartmentId = (departmentId) =>{
	//let query = con.select().from("faculty").innerJoin('department','faculty.worksfor','=','department.nr').where('faculty.worksfor',departmentId);
	let query = con.select().from("faculty").where('faculty.worksfor', departmentId);
	return query.then(rows => rows.map(row => new Fa(row)));;
}

const getBachlorObtainerbyUniverId = (universityId) =>{
	let query = con.select().from('faculty').where('undergraduatedegreefrom',universityId);
	return query.then(rows => rows.map(row => new Fa(row)));
}

const getMasterObtainerbyUniverId = (universityId) =>{
	let query = con.select().from('faculty').where('masterdegreefrom',universityId);
	return query.then(rows => rows.map(row => new Fa(row)));
}

class faculty{
	constructor(){
		this.GetDoctoralDegreeById = memoize(getDoctoralDegreeById);
		this.GetDoctoralDegreeByWorkFor = memoize(getDoctoralDegreeByWorkFor);
		this.GetDepartmentByFacultyId = memoize(getFacultybyDepartmentId);
		this.GetFacultyLecturer = memoize(getFacultyLecturer);
		this.GetFacultyProfessor = memoize(getFacultyProfessor);
		this.GetFacultyById = memoize(getFacultyById);
		this.GetBachlorObtainerbyUniverId = memoize(getBachlorObtainerbyUniverId);
		this.GetMasterObtainerbyUniverId = memoize(getMasterObtainerbyUniverId);
	}
	memoizeGetDoctoralDegreeById(nr){
		return this.GetDoctoralDegreeById(nr);
	}
	memoizeGetDoctoralDegreeByWorkFor(nr, works){
		return this.GetDoctoralDegreeByWorkFor(nr, works);
	}
	memoizeGetDepartmentByFacultyId(nr){
		return this.GetDepartmentByFacultyId(nr);
	}
	memoizeGetFacultyLecturer(nr){
		return this.GetFacultyLecturer(nr);
	}
	memoizeGetFacultyProfessor(nr){
		return this.GetFacultyProfessor(nr);
	}
	memoizeGetFacultyById(nr){
		return this.GetFacultyById(nr);
	}
	memoizeGetBachlorObtainerbyUniverId(nr){
		return this.GetBachlorObtainerbyUniverId(nr);
	}
	memoizeGetMasterObtainerbyUniverId(nr){
		return this.GetMasterObtainerbyUniverId(nr);
	}
}

module.exports={
	faculty
}