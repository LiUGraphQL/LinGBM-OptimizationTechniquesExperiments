const DataLoader = require('dataloader')
const con = require("../database/db");
const { simpleSortRows, allGeneric } = require('../helpers');
const cache = require('../config.js');

//load models
const UndergraduateCourses = require('../model/undergraduatecourse');
const UndergraduateTakeCourses  =require('../model/undergraduatestudenttakecourse')


const getUndergratudateCourseByTeacherIds = (teacherIds) => {

	let query = con.select()
		.from('undergraduatecourse')
		.whereIn('teacher',teacherIds);
		// A loader needs to return items in the correct order, this sorts them.
	return query.then(rows =>
		teacherIds.map(nr =>
		  rows.filter(row => row.teacher == nr).map(row => new UndergraduateCourses(row))
		)
	  );
	
};


//undergraduate student taken courses
const getUndergraduateTakeCourses = (undergraduateStudentIds) => {
	let query = con.select()
		.from("undergraduatestudenttakecourse")
		.innerJoin('undergraduatecourse','undergraduatecourse.nr','=','undergraduatestudenttakecourse.undergraduatecourseid')
		.whereIn('undergraduatestudenttakecourse.undergraduatestudentid', undergraduateStudentIds);
		
		// A loader needs to return items in the correct order, this sorts them.
	return query.then(rows =>
		undergraduateStudentIds.map(nr =>
		  rows.filter(row => row.undergraduatestudentid == nr).map(row => new UndergraduateTakeCourses(row))
		)
	  );
	
};

class undergratudateCourse{
	constructor(){
		this.GetUndergratudateCourseByTeacherIds = new DataLoader(getUndergratudateCourseByTeacherIds, {cache});
		this.GetUndergraduateTakeCourses = new DataLoader(getUndergraduateTakeCourses, {cache});
	}
	loaderGetUndergratudateCourseByTeacherIds(nr){
		return this.GetUndergratudateCourseByTeacherIds.load(nr);
	}
	loaderUndergraduateTakeCourses(nr){
		return this.GetUndergraduateTakeCourses.load(nr);
	}
}

module.exports = {
	undergratudateCourse
}