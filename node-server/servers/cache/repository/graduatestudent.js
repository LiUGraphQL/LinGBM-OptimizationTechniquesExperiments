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


const getGraduateStudentById = (Id) =>{
	let query = con.select().from('graduatestudent').where('nr',Id);
	let result = query.then(rows => rows.map(row => new GraduateStudent(row)));
	return result;
}

const getGraduateStudentbyUniversity = nrs => {
	
	let query = con.select().from('graduatestudent').where('graduatestudent.undergraduatedegreefrom',nrs);
	let result = query.then(rows => rows.map(row => new GraduateStudent(row)));

	return result;
};

const getGradStudentbyDepID = departmentID => {
	let query = con.select().from('graduatestudent').where('memberof',departmentID);
	let result = query.then(rows => rows.map(row => new GraduateStudent(row)));

	return result;
};


const getGdStudentPlusAdvisor = () => {
	let query = con.select().from('graduatestudent').leftOuterJoin('professor','professor.nr','=','graduatestudent.advisor');
	let result = query.then(rows => rows.map(row => new GraduateStudent(row)));

	return result;
};

const getGdStudentByAdvisorID = (advisorID) => {
	let query = con.select().from('graduatestudent').where('graduatestudent.advisor',advisorID);
	let result = query.then(rows => rows.map(row => new GraduateStudent(row)));
	return result;
};

const getGdStudentPlusAdvisorByUniID = nrs => {
	
	let query = con.select().from('graduatestudent').leftOuterJoin('professor','professor.nr','=','graduatestudent.advisor').where('graduatestudent.undergraduatedegreefrom',nrs);
	let result = query.then(rows => rows.map(row => new GraduateStudent(row)));

	return result;
};

const getGraduateStudentPublications = (publicationId) =>{
	let query = con.select().from('coauthorofpublication')
				.innerJoin('graduatestudent','graduatestudent.nr','=','coauthorofpublication.graduatestudentid')
				.where('coauthorofpublication.publicationid',publicationId);
	let result = query.then(rows => rows.map(row => new GraduateStudent(row)));
	return result;
}

const getAllGraduateStudents = () =>{
	let query = con.select().from('graduatestudent');
	let result = query.then(rows => rows.map(row => new GraduateStudent(row)));
	return result
}

const getGraStudentByCourseID = (courseId) =>{
	let query = con.select().from("graduatestudenttakecourse").innerJoin('graduatestudent','graduatestudent.nr','=','graduatestudenttakecourse.graduatestudentid').where('graduatestudenttakecourse.graduatecourseid', courseId);
	let result = query.then(rows => rows.map(row => new GraduateStudent(row)));
	return result;
}

class graduateStudent{
	constructor(){
		this.GetGdStudentPlusAdvisorByUniID = memoize(getGdStudentPlusAdvisorByUniID);
		this.GetGraduateStudentbyUniversity = memoize(getGraduateStudentbyUniversity);
		this.GetAllGraduateStudents = memoize(getAllGraduateStudents);
		this.GetGraStudentByCourseID = memoize(getGraStudentByCourseID);
		this.GetGraduateStudentById = memoize(getGraduateStudentById);
		this.GetGradStudentbyDepID = memoize(getGradStudentbyDepID);
		this.GetGdStudentByAdvisorID = memoize(getGdStudentByAdvisorID);
	}
	memoizeGetGraduateStudentPlusAdvisor(nr){
		return this.GetGdStudentPlusAdvisorByUniID(nr);
	}
	memoizeGetGraduateStudent(nr){
		return this.GetGraduateStudentbyUniversity(nr);
	}
	memoizeGetAllGraduateStudent(){
		return this.GetAllGraduateStudents("all");
	}
	memoizeGetGraStudentByCourseID(nr){
		return this.GetGraStudentByCourseID(nr);
	}
	memoizeGetGraduateStudentById(nr){
		return this.GetGraduateStudentById(nr);
	}
	memoizeGetGradStudentbyDepID(nr){
		return this.GetGradStudentbyDepID(nr);
	}
	memoizeGetGdStudentByAdvisorID(nr){
		return this.GetGdStudentByAdvisorID(nr);
	}
}

module.exports = {
	graduateStudent
}