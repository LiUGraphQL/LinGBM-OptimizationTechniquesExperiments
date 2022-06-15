// required modules
const DataLoader = require('dataloader')
const con = require("../database/db");
const { simpleSortRows, allGeneric } = require('../helpers');
const cache = require('../config.js');

// loads models
const Fa = require("../model/faculty");
const Lecturer = require("../model/lecturer");
const Professor = require("../model/professor");

// get facuilty member by id
const getFacultyById = (facultyIds) =>{
	let query = con.select()
		.from("faculty")
		.whereIn('nr',facultyIds);
	return query.then(rows => simpleSortRows(rows, facultyIds, Fa));
};


const getUndergraduatedegreeFrom = (undergraduatedegreefromIds) =>{
	let query = con
		.select()
		.from('faculty')
		.whereIn('undergraduatedegreefrom',undergraduatedegreefromIds);

	return query.then(rows =>
		undergraduatedegreefromIds.map(nr =>
			rows.filter(row => row.undergraduatedegreefrom === nr).map(row => new Fa(row))
		)
	);
};


const getMasterdegreeFrom = (masterdegreefromIds) =>{
	let query = con
		.select()
		.from('faculty')
		.whereIn('masterdegreefrom',masterdegreefromIds);
	
	return query.then(rows =>
		masterdegreefromIds.map(nr =>
			rows.filter(row => row.masterdegreefrom == nr).map(row => new Fa(row))
		)
	);
};

const getfacultyWorksfor  =  (doctoraldegreefromIds) =>{
	const  {doctoralIds,where} = doctoraldegreefromIds[0];
	let doctoraldegreeIds = [doctoralIds]
	let query = "";
	//if where works for
	if(where){
		let worksFor = parseInt(where.worksFor.nr);
		query = con
			.select()
			.from('faculty')
			.whereIn('doctoraldegreefrom',doctoraldegreeIds).where('worksfor',worksFor)	
	}
	else{
		// without where
		query = con
		.select()
		.from('faculty')
		.whereIn('doctoraldegreefrom',doctoraldegreeIds)
	}
	return query.then(rows =>
		doctoraldegreeIds.map(nr =>
			rows.filter(row => (row.doctoraldegreefrom == nr)).map(row => new Fa(row))
		)
	);
};

const getFacultiesByDepartmentId = (departmentId) =>{
	let query = con.select()
		.from("faculty")
		.innerJoin('department','faculty.worksfor','=','department.nr')
		.whereIn('faculty.worksfor',departmentId);
	return query.then(rows =>
		departmentId.map(nr =>
			rows.filter(row => row.nr == nr).map(row => new Fa(row))
		)
	);
};

const getHeadOfDepartment = (nrs) => {
	let query = con.select()
		.from("professor")
		.innerJoin('faculty','faculty.nr','=','professor.nr')
		.whereIn('professor.headof',nrs);
	return query.then(rows => rows.length > 0?
		nrs.map(nr =>
			rows.filter(row => row.headof == nr).map(row => new Professor(row))
		):[null]
	);
};

class faculty{
	constructor(){
		//this.GetDoctordegreeFrom = new DataLoader(getDoctordegreeFrom, {cache});
		this.GetUndergraduatedegreeFrom = new DataLoader(getUndergraduatedegreeFrom, {cache});
		this.GetMasterdegreeFrom = new DataLoader(getMasterdegreeFrom, {cache});
		this.GetfacultyWorksfor = new DataLoader(getfacultyWorksfor, {cache});
		this.GetFacultiesByDepartmentId = new DataLoader(getFacultiesByDepartmentId, {cache});
		this.GetFacultyById = new DataLoader(getFacultyById, {cache});
		this.GetHeadOfDepartment = new DataLoader(getHeadOfDepartment, {cache});
	}
	loaderfacultyGetUndergraduatedegreeFrom(nr){
		return this.GetUndergraduatedegreeFrom.load(nr);
	}
	loaderfacultyGetmasterdegreeFrom(nr){
		return this.GetMasterdegreeFrom.load(nr);
	}
	loaderfacultyGetWorksfor({doctoralIds,where}){
		return this.GetfacultyWorksfor.load({doctoralIds,where})
	}
	loaderGetFacultiesByDepartmentId(nr){
		return this.GetFacultiesByDepartmentId.load(nr);
	}
	loaderGetFacultyById(nr){
		return this.GetFacultyById.load(nr);
	}
	loaderGetHeadOfDepartment(nr){
		return this.GetHeadOfDepartment.load(nr);
	}
}

module.exports={
	faculty
}