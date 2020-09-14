// required modules
const DataLoader = require('dataloader')
const con = require("../database/db");
const {simpleSortRows, allGeneric } = require('../helpers');
const cache = require('../config.js');

// loads models
const Department = require("../model/department");
const UndergraduateStudent = require("../model/undergraduatestudent");
const GraduateStudent = require("../model/graduatestudent");
const Professor = require("../model/professor");

const getDepartmentsByid= (nrs) =>{
	let query = con
		.select()
		.from('department')
		.whereIn('nr',nrs);
	return query.then(rows => simpleSortRows(rows, nrs, Department));
};

const getDepartmentsBySuborganizationId= (universityID) =>{
	let query = con
		.select()
		.from('department')
		.whereIn('suborganizationof',universityID);
	return query.then(rows =>
		universityID.map(nr =>
			rows.filter(row => row.suborganizationof == nr).map(row => new Department(row))
		)
	);
};

class department{
	constructor(){
		this.GetDepartmentsBySuborganizationId = new DataLoader(getDepartmentsBySuborganizationId, {cache});
		this.GetDepartmentsByid = new DataLoader(getDepartmentsByid, {cache});
	}
	loaderGetDepartmentsBySuborganizationId(nr){
		return this.GetDepartmentsBySuborganizationId.load(nr);
	}
	loaderGetDepartmentsById(nr){
		return this.GetDepartmentsByid.load(nr);
	}

}

module.exports={
	department
}