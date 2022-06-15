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


const getResearchGroupById = (id) =>{
	let query = con.select().from('researchgroup').where('nr',id);
	return query.then(rows => new RG(rows[0]))
}

class researchGroup{
	constructor(){
		//this.GetResearch = memoize(getResearch);
		this.GetResearchGroupById = memoize(getResearchGroupById);
	}
	memoizeGetResearchGroupById(nr){
		return this.GetResearchGroupById(nr);
	}
}

module.exports={
	researchGroup
}