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

const getDepartmentHeadById = (id) =>{
	//let query = con.select().from("professor").innerJoin('faculty','faculty.worksfor','=','professor.headof').where('professor.nr',id);
	let query = con.select().from("professor").innerJoin('faculty','faculty.nr','=','professor.nr').where('professor.headof',id);
	return query.then(rows => (rows.length >0) ? new Professor(rows[0]):null); 
}

const getProfessorById = (id) =>{
	let query = con.select().from("faculty").innerJoin('professor','professor.nr' ,"=",'faculty.nr').where('professor.nr',id);
	return query.then(rows => new Professor(rows[0]));

}

const getProfessorbyDepartmentId = (departmentId) =>{
	let query = con.select().from("faculty").innerJoin('professor','professor.nr','=','faculty.nr').where('faculty.worksfor',departmentId);
	return query.then(rows => rows.map(row => new Professor(row)));
}

class professor{
	constructor(){
		this.GetDepartmentHeadById = memoize(getDepartmentHeadById);
		this.GetProfessorById = memoize(getProfessorById);
		this.GetProfessorbyDepartmentId = memoize(getProfessorbyDepartmentId);
	}
	memoizeGetDepartmentHeadById(nr){
		return this.GetDepartmentHeadById(nr);
	}
	memoizegGetProfessorById(nr){
		return this.GetProfessorById(nr);
	}
	memoizegGetProfessorbyDepartmentId(nr){
		return this.GetProfessorbyDepartmentId(nr);
	}
}

module.exports = {
	professor
}

