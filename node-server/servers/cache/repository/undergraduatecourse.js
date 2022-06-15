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

const getUngradCoursesByFacultyID = (facultyId) =>{
	let query = con.select().from('undergraduatecourse').where('teacher',facultyId);
	let result = query.then(rows => rows.map(row => new UndergraduateCourses(row)));
	return result;
}


const getUngradCourseByAssistantID = (graduateStudentId) =>{
	let query = con.select().from("undergraduatecourse").where('teachingassistant',graduateStudentId);
	let result = query.then(rows => rows.map(row => new UndergraduateCourses(row)));
	return result;
}

const getUndergradCoursesByStudentID = (studentId) =>{
	let query = con.select().from("undergraduatestudenttakecourse").innerJoin('undergraduatecourse','undergraduatecourse.nr','=','undergraduatestudenttakecourse.undergraduatecourseid').where('undergraduatestudenttakecourse.undergraduatestudentid', studentId);
	let result = query.then(rows => rows.map(row => new UndergraduateTakeCourses(row)));
	return result;
}

class undergratudateCourse{
	constructor(){
		this.GetUngradCoursesByFacultyID = memoize(getUngradCoursesByFacultyID);
		this.GetUngradCourseByAssistantID = memoize(getUngradCourseByAssistantID);
		this.GetUndergradCoursesByStudentID = memoize(getUndergradCoursesByStudentID);
	}
	memoizeGetUngradCoursesByFacultyID(nr){
		return this.GetUngradCoursesByFacultyID(nr);
	}
	memoizeGetUngradCourseByAssistantID(nr){
		return this.GetUngradCourseByAssistantID(nr);
	}
	memoizeGetUndergradCoursesByStudentID(nr){
		return this.GetUndergradCoursesByStudentID(nr);
	}
}

module.exports = {
	undergratudateCourse
}