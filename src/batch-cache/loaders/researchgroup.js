const DataLoader = require('dataloader')
const con = require("../database/db");
const { simpleSortRows, allGeneric } = require('../helpers');
const RG = require("../model/researchGroup");
const Department = require('../model/department')
const cache = require('../config.js');



const getResearch= (nrs) =>{
	let query = con
		.select()
		.from('researchgroup')
		.whereIn('nr',nrs);
	return query.then(rows => simpleSortRows(rows, nrs, RG));
};

const getDepartmentbyResearchG= (nrs) =>{
	let query = con
		.select()
		.from('department')
		.whereIn('nr',nrs);
	return query.then(rows => simpleSortRows(rows, nrs, Department));
};


class researchGroupLoader{
	constructor(){
		this.GetResearch = new DataLoader(getResearch, {cache});
	}
	get(nr){
		return this.GetResearch.load(nr);
	}
}

class loaderDepartmentByResearchGroup{
	constructor(){
		this.GetDepartmentbyResearchG = new DataLoader(getDepartmentbyResearchG, {cache});
	}
	get(nr){
		return this.GetDepartmentbyResearchG.load(nr);
	}
}
//const researchGroupLoader = () => new DataLoader(getResearch, {cache})
//const loaderDepartmentByResearchGroup = () => new DataLoader(getDepartmentbyResearchG, {cache});


module.exports={
	researchGroupLoader,
	loaderDepartmentByResearchGroup
}