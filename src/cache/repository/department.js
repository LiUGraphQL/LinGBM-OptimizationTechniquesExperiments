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


const getDepartmentById = (worksforId) =>{
	let query = con.select().from('department').where('nr',worksforId);
	let result = query.then(rows => new Department(rows[0]));
	return result;
}

const getDepartmentByUniverId = (universityID) =>{
	let query = con.select().from('department').where('suborganizationof',universityID);
	let result =  query.then(rows => rows.map(row => new Department(row)));
	return result;
}

class department{
	constructor(){
		this.GetDepartmentById = memoize(getDepartmentById);
		this.GetDepartmentByUniverId = memoize(getDepartmentByUniverId);
	}
	memoizeGetDepartmentById(nr){
		return this.GetDepartmentById(nr);
	}
	memoizeGetDepartmentByUniverId(nr){
		return this.GetDepartmentByUniverId(nr);
	}

}

module.exports={
	department
}