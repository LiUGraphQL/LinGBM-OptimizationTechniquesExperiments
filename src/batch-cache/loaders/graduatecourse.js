const DataLoader = require('dataloader')
const con = require("../database/db");
const { simpleSortRows, allGeneric } = require('../helpers');
const cache = require('../config.js');

//load models
const GraduateCourse = require('../model/graduatecourse');
const GraduateTakeCourse = require('../model/graduatestudenttakecourse');
const UndergraduateCourses = require('../model/undergraduatecourse');

const getGratudateCourseByTeacherIds = (teacherIds) => {

	let query = con.select()
		.from('graduatecourse')
		.whereIn('teacher',teacherIds);
	// A loader needs to return items in the correct order, this sorts them.
	return query.then(rows =>
		teacherIds.map(nr =>
			rows.filter(row => row.teacher == nr).map(row => new GraduateCourse(row))
		)
	);
	
};


//graduate student taken courses
const getGraduateStudentTakeCourses = (graduateStudentIds) => {
	
	let query = con.select()
		.from("graduatestudenttakecourse")
		.innerJoin('graduatecourse','graduatecourse.nr','=','graduatestudenttakecourse.graduatecourseid')
		.whereIn('graduatestudenttakecourse.graduatestudentid', graduateStudentIds);
		
		// A loader needs to return items in the correct order, this sorts them.
	return query.then(rows =>
		graduateStudentIds.map(nr =>
		  rows.filter(row => row.graduatestudentid == nr).map(row => new GraduateTakeCourse(row))
		)
	  );
	
};



//graduate student assist courses
const getGraduateStudentAssistCourses = (assistIds) => {
	
	let query = con.select()
		.from("undergraduatecourse")
		.whereIn('teachingassistant',assistIds);
		// A loader needs to return items in the correct order, this sorts them.
	return query.then(rows =>
		assistIds.map(nr =>
		  rows.filter(row => row.teachingassistant == nr).map(row => new UndergraduateCourses(row))
		)
	  );
	
};

class loaderGetGratudateCourseByTeacherIds{
	constructor(){
		this.GetGratudateCourseByTeacherIds = new DataLoader(getGratudateCourseByTeacherIds, {cache});
	}
	get(nr){
		return this.GetGratudateCourseByTeacherIds.load(nr);
	}
}
//const loaderGetGratudateCourseByTeacherIds = () => new DataLoader(getGratudateCourseByTeacherIds, {cache});

class loaderGraduateTakeCourses{
	constructor(){
		this.GetGraduateStudentTakeCourses = new DataLoader(getGraduateStudentTakeCourses, {cache});
	}
	get(nr){
		return this.GetGraduateStudentTakeCourses.load(nr);
	}
}
//const loaderGraduateTakeCourses = () => new DataLoader(getGraduateStudentTakeCourses, {cache});

class loaderGraduateAssistCourses{
	constructor(){
		this.GetGraduateStudentAssistCourses = new DataLoader(getGraduateStudentAssistCourses, {cache});
	}
	get(nr){
		return this.GetGraduateStudentAssistCourses.load(nr);
	}
}
//const loaderGraduateAssistCourses = () => new DataLoader(getGraduateStudentAssistCourses, {cache});

module.exports = {
	loaderGetGratudateCourseByTeacherIds,
	loaderGraduateTakeCourses,
	loaderGraduateAssistCourses
}