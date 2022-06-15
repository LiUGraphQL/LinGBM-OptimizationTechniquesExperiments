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


class researchGroup{
	constructor(){
		this.GetResearch = new DataLoader(getResearch, {cache});
	}
	researchGroupLoader(nr){
		return this.GetResearch.load(nr);
	}
}

module.exports={
	researchGroup
}