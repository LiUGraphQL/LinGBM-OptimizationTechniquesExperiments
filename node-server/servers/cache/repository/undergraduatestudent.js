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

const getUnderGraduateStudent = nr => {
	
	let query = con
				.select()
				.from('department')
				.innerJoin('undergraduatestudent','undergraduatestudent.memberof','=','department.nr').
				where('department.nr',nr);
	let result = query.then(rows => rows.map(row => new UndergraduateStudent(row)));

	return result;
};

const getUndergraStudentByCourseID = (courseId) =>{
	let query = con.select().from("undergraduatestudenttakecourse").innerJoin('undergraduatestudent','undergraduatestudent.nr','=','undergraduatestudenttakecourse.undergraduatestudentid').where('undergraduatestudenttakecourse.undergraduatecourseid', courseId);
	let result = query.then(rows => rows.map(row => new UndergraduateStudent(row)));
	return result;
}

const getUndergradStudentbyDepID = departmentID => {
	let query = con.select().from('undergraduatestudent').where('memberof',departmentID);
	let result = query.then(rows => rows.map(row => new UndergraduateStudent(row)));
	return result;
};

const getUndergdStudentByAdvisorID = (advisorID) => {
	let query = con.select().from('undergraduatestudent').where('undergraduatestudent.advisor',parent.id);
	let result = query.then(rows => rows.map(row => new UndergraduateStudent(row)));
	return result;
};

class undergraduateStudent{
	constructor(){
		this.GetUnderGraduateStudent = memoize(getUnderGraduateStudent);
		this.GetUndergraStudentByCourseID = memoize(getUndergraStudentByCourseID);
		this.GetUndergradStudentbyDepID = memoize(getUndergradStudentbyDepID);
		this.GetUndergdStudentByAdvisorID = memoize(getUndergdStudentByAdvisorID);
	}
	memoizeGetUnderGraduateStudent(nr){
		return this.GetUnderGraduateStudent(nr);
	}
	memoizeGetUndergraStudentByCourseID(nr){
		return this.GetUndergraStudentByCourseID(nr);
	}
	memoizeGetUndergradStudentbyDepID(nr){
		return this.GetUndergradStudentbyDepID(nr);
	}
	memoizeGetUndergdStudentByAdvisorID(nr){
		return this.GetUndergdStudentByAdvisorID(nr);
	}
}

module.exports = {
	undergraduateStudent
}