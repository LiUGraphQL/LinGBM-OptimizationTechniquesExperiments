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

class graduateCourse{
	constructor(){
		this.GetGratudateCourseByTeacherIds = new DataLoader(getGratudateCourseByTeacherIds, {cache});
		this.GetGraduateStudentTakeCourses = new DataLoader(getGraduateStudentTakeCourses, {cache});
		this.GetGraduateStudentAssistCourses = new DataLoader(getGraduateStudentAssistCourses, {cache});
	}
	loaderGetGratudateCourseByTeacherIds(nr){
		return this.GetGratudateCourseByTeacherIds.load(nr);
	}
	loaderGraduateTakeCourses(nr){
		return this.GetGraduateStudentTakeCourses.load(nr);
	}
	loaderGraduateAssistCourses(nr){
		return this.GetGraduateStudentAssistCourses.load(nr);
	}
}

module.exports = {
	graduateCourse
}