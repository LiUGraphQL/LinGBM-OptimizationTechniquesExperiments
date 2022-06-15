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

const getLecturerById = (id) =>{
	let query = con.select().from("faculty").innerJoin('lecturer','lecturer.nr' ,"=",'faculty.nr').where('lecturer.nr',id);
	return query.then(rows => (rows.length >0) ? new Lecturer(rows[0]):null);

}

const getLecturerbyDepartmentId = (departmentId) =>{
	let query = con.select().from("faculty").innerJoin('lecturer','lecturer.nr','=','faculty.nr').where('faculty.worksfor', departmentId);
	return query.then(rows => rows.map(row => new Lecturer(row)));
}


class lecturer{
	constructor(){
		this.GetLecturerById = memoize(getLecturerById);
		this.GetLecturerbyDepartmentId = memoize(getLecturerbyDepartmentId);
	}
	memoizeGetLecturerById(nr){
		return this.GetLecturerById(nr);
	}
	memoizeGetLecturerbyDepartmentId(nr){
		return this.GetLecturerbyDepartmentId(nr);
	}
}

module.exports = {
	lecturer
}

