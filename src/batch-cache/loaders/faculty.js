// required modules
const DataLoader = require('dataloader')
const con = require("../database/db");
const { simpleSortRows, allGeneric } = require('../helpers');
const cache = require('../config.js');

// loads models
const Fa = require("../model/faculty");
const Lecturer = require("../model/lecturer");
const Professor = require("../model/professor");


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

const getDoctordegreeFrom = (doctoraldegreeIds) =>{
	let query = con
		.select()
		.from('faculty')
		.whereIn('doctoraldegreefrom',doctoraldegreeIds);
	
	return query.then(rows =>
		doctoraldegreeIds.map(nr =>
			rows.filter(row => row.doctoraldegreefrom == nr).map(row => new Fa(row))
		)
	);
};


const getfacultyWorksfor = (doctoraldegreeIds, where) =>{
	let query = "";
	let worksFor = parseInt(where.worksFor.nr);
	query = con
		.select()
		.from('faculty')
		.whereIn('doctoraldegreefrom',doctoraldegreeIds).where('worksfor',worksFor)
	return query.then(rows =>
		doctoraldegreeIds.map(nr =>
			rows.filter(row => (row.doctoraldegreefrom == nr)).map(row => new Fa(row))
		)
	);
};

// get lecturer who works for department department Id
const getLecturerByDepartmentId = (worksFor) =>{
	let query = con.select()
		.from("faculty")
		.innerJoin('lecturer','lecturer.nr','=','faculty.nr')
		.whereIn('faculty.worksfor',worksFor);
	
	return query.then(rows =>
		worksFor.map(nr =>
			rows.filter(row => row.worksfor == nr).map(row => new Lecturer(row))
		)
	);
};



// get lecturer who works for department department Id
const getProfessorByDepartmentId = (worksFor) =>{
	let query = con.select()
		.from("faculty")
		.innerJoin('professor','professor.nr','=','faculty.nr')
		.whereIn('faculty.worksfor',worksFor);
	
	return query.then(rows =>
		worksFor.map(nr =>
			rows.filter(row => row.worksfor == nr).map(row => new Professor(row))
		)
	);
};


// get facuilties by department id 
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

class loaderfacultyGetDoctordegreeFrom{
	constructor(){
		this.GetDoctordegreeFrom = new DataLoader(getDoctordegreeFrom, {cache});
	}
	get(nr){
		return this.GetDoctordegreeFrom.load(nr);
	}
}

// get facuilty member by id
const getFacultyById = (facultyIds) =>{
	let query = con.select()
		.from("faculty")
		.whereIn('nr',facultyIds);
	return query.then(rows => simpleSortRows(rows, facultyIds, Fa));
};

class loaderfacultyGetUndergraduatedegreeFrom{
	constructor(){
		this.GetUndergraduatedegreeFrom = new DataLoader(getUndergraduatedegreeFrom, {cache});
	}
	get(nr){
		return this.GetUndergraduatedegreeFrom.load(nr);
	}
}
//const loaderfacultyGetUndergraduatedegreeFrom = () => new DataLoader(getUndergraduatedegreeFrom, {cache});

class loaderfacultyGetmasterdegreeFrom{
	constructor(){
		this.GetMasterdegreeFrom = new DataLoader(getMasterdegreeFrom, {cache});
	}
	get(nr){
		return this.GetMasterdegreeFrom.load(nr);
	}
}
//const loaderfacultyGetmasterdegreeFrom = () => new DataLoader(getMasterdegreeFrom, {cache});
class loaderfacultyGetWorksfor{
	constructor(){
		this.GetfacultyWorksfor = new DataLoader(getfacultyWorksfor, {cache});
	}
	get(nr, where){
		return this.GetfacultyWorksfor.load(nr,where);
	}
}
//const loaderfacultyGetWorksfor = () => new DataLoader(getfacultyWorksfor, {cache});

class loaderGetLecturerByDepartmentId{
	constructor(){
		this.GetLecturerByDepartmentId = new DataLoader(getLecturerByDepartmentId, {cache});
	}
	get(nr){
		return this.GetLecturerByDepartmentId.load(nr);
	}
}

//const loaderGetLecturerByDepartmentId = () => new DataLoader(getLecturerByDepartmentId, {cache});
class loaderGetProfessorByDepartmentId{
	constructor(){
		this.GetProfessorByDepartmentId = new DataLoader(getProfessorByDepartmentId, {cache});
	}
	get(nr){
		return this.GetProfessorByDepartmentId.load(nr);
	}
}
//const loaderGetProfessorByDepartmentId = () => new DataLoader(getProfessorByDepartmentId, {cache});
class loaderGetFacultiesByDepartmentId{
	constructor(){
		this.GetFacultiesByDepartmentId = new DataLoader(getFacultiesByDepartmentId, {cache});
	}
	get(nr){
		return this.GetFacultiesByDepartmentId.load(nr);
	}
}
//const loaderGetFacultiesByDepartmentId = () => new DataLoader(getFacultiesByDepartmentId, {cache});

class loaderGetFacultyById{
	constructor(){
		this.GetFacultyById = new DataLoader(getFacultyById, {cache});
	}
	get(nr){
		return this.GetFacultyById.load(nr);
	}
}
//const loaderGetFacultyById = () => new DataLoader(getFacultyById, {cache});

module.exports={
	loaderfacultyGetUndergraduatedegreeFrom,
	loaderfacultyGetmasterdegreeFrom,
	loaderfacultyGetWorksfor,
	loaderGetLecturerByDepartmentId,
	loaderGetProfessorByDepartmentId,
	loaderGetFacultiesByDepartmentId,
	loaderGetFacultyById,
	loaderfacultyGetDoctordegreeFrom
}