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


const getPublication = () =>{

	let query = con.select().from('publication');
	let result = query.then(rows => rows.map(row => new Publication(row)));
	return result;
}

const getPublicationByAuthor = (author) =>{
	let query = con.select().from('publication').where('mainauthor',author);
	let result = query.then(rows => (rows.length>0) ? rows.map(row => new Publication(row)): null);
	return result;
}

class publication{
	constructor(){
		this.GetPublication = memoize(getPublication);
		this.GetPublicationByAuthor = memoize(getPublicationByAuthor);
	}
	memoizeGetPublication(){
		return this.GetPublication("all");
	}
	memoizeGetPublicationByAuthor(nr){
		return this.GetPublicationByAuthor(nr);
	}

}

module.exports = {
	publication
}
