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

const getGraduateStudentTakeCourses = (studentId) =>{
	let query = con.select().from("graduatestudenttakecourse").innerJoin('graduatecourse','graduatecourse.nr','=','graduatestudenttakecourse.graduatecourseid').where('graduatestudenttakecourse.graduatestudentid', studentId);
	let result = query.then(rows => rows.map(row => new GradudateCourse(row)));
	return result;
}

const getGradCoursesByFacultyID = (facultyId) =>{
	let query = con.select().from('graduatecourse').where('teacher',facultyId);
	let result = query.then(rows => rows.map(row => new GraduateCourse(row)));
	return result;
}

class graduateCourse{
	constructor(){
		this.GetGraduateStudentTakeCourses = memoize(getGraduateStudentTakeCourses);
		this.GetGradCoursesByFacultyID = memoize(getGradCoursesByFacultyID);
	}

	memoizeGetGraduateStudentTakeCourses(nr){
		return this.GetGraduateStudentTakeCourses(nr);
	}
	memoizeGetGradCoursesByFacultyID(nr){
		return this.GetGradCoursesByFacultyID(nr);
	}
}

module.exports = {
	graduateCourse
}