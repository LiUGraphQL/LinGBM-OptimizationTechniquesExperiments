const Fa = require("./model/faculty");
const RG = require("./model/researchGroup");
const University = require("./model/university");
const Lecturer = require("./model/lecturer");
const GraduateCourse = require("./model/graduatecourse");
const GraduateStudent = require("./model/graduatestudent");
const UndergraduateCourses = require('./model/undergraduatecourse');
const UndergraduateStudent = require('./model/undergraduatestudent');
const Publication = require('./model/publication');
const Author = require('./model/author');
const Department = require('./model/department');
const Professor = require('./model/professor')
const UndergraduateTakeCourses  =require('./model/undergraduatestudenttakecourse')
const GradudateCourse = require('./model/graduatecourse');

const _ = require("lodash");
const con = require("./database/db");
const { simpleSortRows, allGeneric, memoize } = require('./helpers');

var rp = require('request-promise');
const DataLoader = require('dataloader')
const cache =  require("./config")

const getGraduateStudentbyUniversity = nrs => {
	
	let query = con.select().from('graduatestudent').where('graduatestudent.undergraduatedegreefrom',nrs);
	let result = query.then(rows => rows.map(row => new GraduateStudent(row)));

	return result;
  };

  const getGdStudentPlusAdvisor = () => {
	
	let query = con.select().from('graduatestudent').leftOuterJoin('professor','professor.nr','=','graduatestudent.advisor');
	let result = query.then(rows => rows.map(row => new GraduateStudent(row)));

	return result;
  };

  const getGdStudentPlusAdvisorByUniID = nrs => {
	
	let query = con.select().from('graduatestudent').leftOuterJoin('professor','professor.nr','=','graduatestudent.advisor').where('graduatestudent.undergraduatedegreefrom',nrs);
	let result = query.then(rows => rows.map(row => new GraduateStudent(row)));

	return result;
  };

  const getFacultyLecturer = facultyId => {
	let query = con.select().from("faculty").innerJoin('lecturer','lecturer.nr' ,"=",'faculty.nr').where('faculty.nr',facultyId);
	
	return query.then(rows => (rows.length >0) ? new Lecturer(rows[0]):null);
  };


  const getFacultyProfessor = facultyId => {
	let query = con.select().from("faculty").innerJoin('professor','professor.nr' ,"=",'faculty.nr').where('faculty.nr',facultyId);
	 return query.then(rows => (rows.length >0) ? new Professor(rows[0]):null);
  };
  const getUnderGraduateStudent = nr => {
	
	let query = con
				.select()
				.from('department')
				.innerJoin('undergraduatestudent','undergraduatestudent.memberof','=','department.nr').
				where('department.nr',nr);
	let result = query.then(rows => rows.map(row => new UndergraduateStudent(row)));

	return result;
  };

  const getPublication = () =>{

	let query = con.select().from('publication');
	let result = query.then(rows => rows.map(row => new Publication(row)));
	return result;
  }


 const getPublicationByAuthor = (author) =>{
	 console.log("memory")
	let query = con.select().from('publication').where('mainauthor',author);
	let result = query.then(rows => (rows.length>0) ? rows.map(row => new Publication(row)): null);
	return result;
  }


const getGraduateStudentPublications = (publicationId) =>{
	let query = con.select().from('coauthorofpublication')
				.innerJoin('graduatestudent','graduatestudent.nr','=','coauthorofpublication.graduatestudentid')
				.where('coauthorofpublication.publicationid',publicationId);
	let result = query.then(rows => rows.map(row => new GraduateStudent(row)));
	return result;
}

const getAllGraduateStudents = () =>{
	let query = con.select().from('graduatestudent');
	let result = query.then(rows => rows.map(row => new GraduateStudent(row)));
	return result
}


const getUniversityById = (universityId) =>{
	let query = con.select().from('university').where('nr',parseInt(universityId));
	let result = query.then(rows => new University(rows[0]));
	return result;
}

const getDoctoralDegreeById = (id) =>{
	console.log('memory')
	let query = con.select().from('faculty').where('doctoraldegreefrom',id);
	let result = query.then(rows => rows.map(row => new Fa(row)));
	return result;
	
}


const getDoctoralDegreeByWorkFor = (id,worksFor) =>{
	let query  = con.select().from('faculty').where('doctoraldegreefrom',id).andWhere('worksfor',parseInt(worksFor));
	let result = query.then(rows => rows.map(row => new Fa(row)));
	return result;
}

const getGraduateStudentTakeCourses = (studentId) =>{
	let query = con.select().from("graduatestudenttakecourse").innerJoin('graduatecourse','graduatecourse.nr','=','graduatestudenttakecourse.graduatecourseid').where('graduatestudenttakecourse.graduatestudentid', studentId);
	let result = query.then(rows => rows.map(row => new GradudateCourse(row)));
	return result;
}


const getResearchGroupById = (id) =>{
	let query = con.select().from('researchgroup').where('nr',id);
	return query.then(rows => new RG(rows[0]))
}


const getDepartmentHeadById = (id) =>{
	//let query = con.select().from("professor").innerJoin('faculty','faculty.worksfor','=','professor.headof').where('professor.nr',id);
	let query = con.select().from("professor").innerJoin('faculty','faculty.nr','=','professor.nr').where('professor.headof',id);
	return query.then(rows => (rows.length >0) ? new Professor(rows[0]):null); 
}


const getLecturerById = (id) =>{
	let query = con.select().from("faculty").innerJoin('lecturer','lecturer.nr' ,"=",'faculty.nr').where('lecturer.nr',id);
	return query.then(rows => (rows.length >0) ? new Lecturer(rows[0]):null);

}

const getGraduateStudentAdvisorById = (adviosrId) =>{
	let query = con.select().from("faculty").innerJoin('professor','professor.nr' ,"=",'faculty.nr').where('professor.nr',adviosrId);
	return query.then(rows => new Professor(rows[0]));

}

const getDepartmentById = (worksforId) =>{
	let query = con.select().from('department').where('nr',worksforId);
	let result = query.then(rows => new Department(rows[0]));
	return result;
}

const getDepartmentByFacultyId = (departmentId) =>{
	//let query = con.select().from("faculty").innerJoin('department','faculty.worksfor','=','department.nr').where('faculty.worksfor',departmentId);
	let query = con.select().from("faculty").where('faculty.worksfor', departmentId);
	return query.then(rows => rows.map(row => new Fa(row)));;
}

const getGraduateStudentMemberOf = (memberId) =>{
	let query = con.select().from("department").where('nr', memberId);
	return query.then(rows => new Department(rows[0]));
}


/// memorized function calling
//let

//function memoizeGetUniversityById(){
//	UniversityById = memoize(getUniversityById);
//}
//memoizeGetUniversityById.prototype.get = function(){
//	return this.UniversityById;
//}

//const memoizeGetUniversityById = () => memoize(getUniversityById);
//const memoizeGetGraduateStudentPlusAdvisor = () => memoize(getGdStudentPlusAdvisorByUniID);
//const memoizeGetGraduateStudent = () => memoize(getGraduateStudentbyUniversity);
//const memoizeGetPublication = () => memoize(getPublication);
//const memoizeGetAllGraduateStudent  = () => memoize ( getAllGraduateStudents );
//const memoizeGetDoctoralDegreeById = () => memoize(getDoctoralDegreeById);
//const memoizeGetDoctoralDegreeByWorkFor = () => memoize(getDoctoralDegreeByWorkFor);
//const memoizeGetPublicationByAuthor = () => memoize(getPublicationByAuthor);
//const memoizeGetGraduateStudentTakeCourses = () => memoize(getGraduateStudentTakeCourses);
//const memoizeGetUnderGraduateStudent = () => memoize(getUnderGraduateStudent);
//const memoizeGetResearchGroupById = () => memoize(getResearchGroupById);
//const memoizeGetDepartmentHeadById = () => memoize(getDepartmentHeadById);
//const memoizeGetLecturerById = () => memoize(getLecturerById);
//const memoizegGetGraduateStudentAdvisorById = () => memoize(getGraduateStudentAdvisorById);
//const memoizeGetDepartmentById  = () => memoize(getDepartmentById);
//const memoizeGetDepartmentByFacultyId = () => memoize(getDepartmentByFacultyId);
//const memoizeGetGraduateStudentMemberOf = () => memoize(getGraduateStudentMemberOf); 
//const memoizeGetFacultyLecturer = () => memoize(getFacultyLecturer); 

class memoizeGetUniversityById {
	constructor(){
		this.UniversityById = memoize(getUniversityById);
	}
	get(nr){
		return this.UniversityById(nr);
	}
}

class memoizeGetGraduateStudentPlusAdvisor {
	constructor(){
		this.GetGdStudentPlusAdvisorByUniID = memoize(getGdStudentPlusAdvisorByUniID);
	}
	get(nr){
		return this.GetGdStudentPlusAdvisorByUniID(nr);
	}
}

class memoizeGetGraduateStudent {
	constructor(){
		this.GetGraduateStudentbyUniversity = memoize(getGraduateStudentbyUniversity);
	}
	get(nr){
		return this.GetGraduateStudentbyUniversity(nr);
	}
}

class memoizeGetPublication {
	constructor(){
		this.GetPublication = memoize(getPublication);
	}
	all(){
		return this.GetPublication("all");
	}
}

class memoizeGetAllGraduateStudent {
	constructor(){
		this.GetAllGraduateStudents = memoize(getAllGraduateStudents);
	}
	all(){
		return this.GetAllGraduateStudents("all");
	}
}

class memoizeGetDoctoralDegreeById {
	constructor(){
		this.GetDoctoralDegreeById = memoize(getDoctoralDegreeById);
	}
	get(nr){
		return this.GetDoctoralDegreeById(nr);
	}
}

class memoizeGetDoctoralDegreeByWorkFor {
	constructor(){
		this.GetDoctoralDegreeByWorkFor = memoize(getDoctoralDegreeByWorkFor);
	}
	get(nr, works){
		return this.GetDoctoralDegreeByWorkFor(nr, works);
	}
}

class memoizeGetPublicationByAuthor {
	constructor(){
		this.GetPublicationByAuthor = memoize(getPublicationByAuthor);
	}
	get(nr){
		return this.GetPublicationByAuthor(nr);
	}
}

class memoizeGetGraduateStudentTakeCourses {
	constructor(){
		this.GetGraduateStudentTakeCourses = memoize(getGraduateStudentTakeCourses);
	}
	get(nr){
		return this.GetGraduateStudentTakeCourses(nr);
	}
}

class memoizeGetUnderGraduateStudent {
	constructor(){
		this.GetUnderGraduateStudent = memoize(getUnderGraduateStudent);
	}
	get(nr){
		return this.GetUnderGraduateStudent(nr);
	}
}

class memoizeGetResearchGroupById {
	constructor(){
		this.GetResearchGroupById = memoize(getResearchGroupById);
	}
	get(nr){
		return this.GetResearchGroupById(nr);
	}
}

class memoizeGetDepartmentHeadById {
	constructor(){
		this.GetDepartmentHeadById = memoize(getDepartmentHeadById);
	}
	get(nr){
		return this.GetDepartmentHeadById(nr);
	}
}

class memoizeGetLecturerById {
	constructor(){
		this.GetLecturerById = memoize(getLecturerById);
	}
	get(nr){
		return this.GetLecturerById(nr);
	}
}

class memoizegGetGraduateStudentAdvisorById {
	constructor(){
		this.GetGraduateStudentAdvisorById = memoize(getGraduateStudentAdvisorById);
	}
	get(nr){
		return this.GetGraduateStudentAdvisorById(nr);
	}
}

class memoizeGetDepartmentById {
	constructor(){
		this.GetDepartmentById = memoize(getDepartmentById);
	}
	get(nr){
		return this.GetDepartmentById(nr);
	}
}

class memoizeGetDepartmentByFacultyId {
	constructor(){
		this.GetDepartmentByFacultyId = memoize(getDepartmentByFacultyId);
	}
	get(nr){
		return this.GetDepartmentByFacultyId(nr);
	}
}

class memoizeGetGraduateStudentMemberOf {
	constructor(){
		this.GetGraduateStudentMemberOf = memoize(getGraduateStudentMemberOf);
	}
	get(nr){
		return this.GetGraduateStudentMemberOf(nr);
	}
}

class memoizeGetFacultyLecturer {
	constructor(){
		this.GetFacultyLecturer = memoize(getFacultyLecturer);
	}
	get(nr){
		return this.GetFacultyLecturer(nr);
	}
}

class memoizeGetFacultyProfessor {
	constructor(){
		this.GetFacultyProfessor = memoize(getFacultyProfessor);
	}
	get(nr){
		return this.GetFacultyProfessor(nr);
	}
}



module.exports = {
    memoizeGetGraduateStudentPlusAdvisor,
    memoizeGetGraduateStudent,
    memoizeGetPublication,
    memoizeGetAllGraduateStudent,
    memoizeGetUniversityById,
    memoizeGetDoctoralDegreeById,
    memoizeGetDoctoralDegreeByWorkFor,
    memoizeGetPublicationByAuthor,
    memoizeGetGraduateStudentTakeCourses,
    memoizeGetUnderGraduateStudent,
    memoizeGetResearchGroupById,
    memoizeGetDepartmentHeadById,
    memoizeGetLecturerById,
    memoizegGetGraduateStudentAdvisorById,
    memoizeGetDepartmentById,
    memoizeGetDepartmentByFacultyId,
    memoizeGetGraduateStudentMemberOf,
    memoizeGetFacultyLecturer,
    memoizeGetFacultyProfessor
}
