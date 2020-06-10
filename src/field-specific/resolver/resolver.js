const con = require("../database/db");
var rp = require('request-promise');
const DataLoader = require('dataloader')
const cache =  require("../config")
const { simpleSortRows, allGeneric } = require('../helpers');
const _ = require("lodash");

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
const resolvers = {
		
	Faculty:{
		
		__resolveType:(parent, context, info) => {
			
			if(parent.position)
			{
				return "Lecturer"
			}

			if(parent.researchInterest)
			{
				return "Professor"
			}

			return null;
		}
			
		},
		Professor:{
			__resolveType(obj,context,info)
			{

				console.log("obj:",obj);
				return null;
			}
		},
		Author:{
			__resolveType(parent, context, info)
			{
				
				if(parent.position)
				{
					return "Lecturer";
				}

				if(parent.researchInterest)
				{
					return "Professor";
				}

				if(parent.age)
				{
					return "GraduateStudent";
				}
				
				return null
			}
		},
		Query: {
			
			faculty: async ( _ , {nr} ) =>{
			
				let lecturer = await getFacultyLecturer(parseInt(nr));
				let professor = await getFacultyProfessor(parseInt(nr));
				let arr = (lecturer) ? lecturer: professor;
				return  arr;
			},
			researchGroup:(_,{nr} ) => {
				let query = con
							.select()
							.from('researchgroup')
							.where('nr',nr);
				return query.then(rows => new RG(rows[0]))
			},
			university(_,{nr}){
				let query = con
							.select()
							.from('university')
							.where('nr',parseInt(nr));
				let result = query.then(rows => new University(rows[0]));
				return result;
			},
			department(_,{nr}){
				let query = con
							.select()
							.from('department')
							.where('nr',parseInt(nr));
				let result = query.then(rows => new Department(rows[0]));
				return result;
			},
			async publicationSearch(_,args  ){
				
				let publicaitons = await getPublication();
				let result = resolvePublication(publicaitons, args);
				console.log("result : ",result)
				
				return result

			},
			async graduateStudents( parent,{ where,  limit , order } ){
				
				let query = con
							.select()
							.from('graduatestudent');

				let students = await query.then(rows => rows.map(row => new GraduateStudent(row)));

				students = limit ? students.slice(0, limit) : students;
				students = order ? _.orderBy(students, order) : students;
				

				// // taking clauses
				const {AND,advisor, university, age} = where || {};

				if(advisor){

					let comment = {nr: parseInt(advisor.nr), criterion: advisor.researchInterest.criterion,pattern:advisor.researchInterest.pattern }
					if(comment.nr)
						resolveAdvisorNrField(students,comment)
					else if(comment.criterion)
						students = resolveAdvisorField(students,comment )
				}

				if(age){
					students = resolveAgeField(students,age )
				}
				if(university){
					students = resolveUniversityField(students,university);
				}


				
				return students;
				
			},
			lecturer(_,{nr}){

				let lecturerId = nr;
				let query = con.select().from("faculty").innerJoin('lecturer','lecturer.nr' ,"=",'faculty.nr').where('lecturer.nr',parseInt(lecturerId));
				let result = query.then(rows => (rows.length >0) ? new Lecturer(rows[0]):null);
				return result
				
			}


			
		},
		Lecturer:{
			id(parent, args, context, info){
				const {id} = parent
				return id
			},
			telephone(parent, args, context, info){
				const {telephone} = parent
				return telephone
			},
			emailAddress(parent, args, context, info){
				const {emailAddress} = parent
				return emailAddress
			},
			teacherOfGraduateCourses(parent, args, context, info)
			{
				let query = con.select().from('graduatecourse').where('teacher',parent.id);
				let result = query.then(rows => rows.map(row => new GraduateCourse(row)));
				return result;
			},
			teacherOfUndergraduateCourses(parent, args, context, info){
				let query = con.select().from('undergraduatecourse').where('teacher',parent.id);
				let result = query.then(rows => rows.map(row => new UndergraduateCourses(row)));
				return result;
			},
			publications(parent, args, context, info){
				
				let query = con.select().from('publication').where('mainauthor',parent.id);
				let result = query.then(rows => rows.map(row => new Publication(row)));
				return result;
			},
			undergraduteDegreeFrom(parent, args, context, info){
				
				let query = con.select().from('university').where('nr',parent.undergraduteDegreeFrom);
				let result = query.then(rows => new University(rows[0]));
				return result;
			},
			masterDegreeFrom(parent, args, context, info){
				
				let query = con.select().from('university').where('nr',parent.masterDegreeFrom);
				let result = query.then(rows => new University(rows[0]));
				return result;
			},
			doctoralDegreeFrom(parent, args, context, info){
				let query = con.select().from('university').where('nr',parent.doctoralDegreeFrom);
				let result = query.then(rows => new University(rows[0]));
				return result;
			},
			worksFor(parent, args, context, info){
				
				let query = con.select().from('department').where('nr',parent.worksFor);
				let result = query.then(rows => new Department(rows[0]));
				return result;
			}
			
			
			
		},
		GraduateCourse:{
			teachedby(parent, args, context, info){
				
				let query = con.select().from("faculty").where('nr',parent.teacher);
				return  query.then(rows => new Fa(rows[0]))
			},
			graduateStudents(parent, args, context, info){

				let query = query = con.select().from('graduatestudent').whereIn('nr',parent.graduatestudentid);
				let result = query.then(rows => rows.map(row => new GraduateStudent(row)));
				return result;
			},
		},
		UndergraduateCourse:{
			teachedby(parent, args, context, info){
				let query = con.select().from("faculty").where('nr',parent.teacher);
				return  query.then(rows => new Fa(rows[0]))
			},
			undergraduateStudents(parent, args, context, info){
				let query  = con.select().from('undergraduatestudent').where('nr',parent.undergraduatestudentid);
		 
				return  query.then(rows => rows.map(row => new Fa(row)));
			
			},
			teachingAssistants(parent, args, context, info){
				let query = con.select().from('graduatestudent').where('nr',parent.teachingassistants);
				let result =  query.then(rows => new GraduateStudent(rows[0]))
				return result;
			}

			
		},
		Publication:{
			async authors(parent, args, context, info){

				let professorPublications = await getFacultyProfessor(parent.mainauthor);
				let lecturerPublications = await getFacultyLecturer(parent.mainauthor);
				let graduateStudent = await getGraduateStudentPublications(parent.id)
				let arr = [professorPublications,lecturerPublications,...graduateStudent]
				 arr = arr.filter(function (el) {
					return el != null;
				  });
				 
				console.log("result : ",arr)

				return arr;
			},
			id(parent, args, context, info){
				const {id} = parent 
				return id
			},

			title(parent, args, context, info){
				const {title} = parent 
				return title
			}
			,

			abstract(parent, args, context, info){
				const {abstract} = parent 
				return abstract
			}
		},
		University:{
			id(parent, args, context, info){
				const {id} = parent
				return id
			},
			undergraduateDegreeObtainedByFaculty(parent, args, context, info){

				let query = con.select().from('faculty').where('undergraduatedegreefrom',parent.id);
				let result = query.then(rows => rows.map(row => new Fa(row)));
				return result;
			},
			mastergraduateDegreeObtainers(parent, args, context, info){
				let query = con.select().from('faculty').where('masterdegreefrom',parent.id);
				let result = query.then(rows => rows.map(row => new Fa(row)));
				return result;
			},
			doctoralDegreeObtainers(parent,{where}){
				let query = "";
				if(where)
					 query = con.select().from('faculty').where('doctoraldegreefrom',parent.id).andWhere('worksfor',parseInt(where.worksFor.nr));
				else
					query = con.select().from('faculty').where('doctoraldegreefrom',parent.id);
				let result = query.then(rows => rows.map(row => new Fa(row)));
				return result;
			},
			async undergraduateDegreeObtainedBystudent(parent,{ where , limit , offset }){
				//let students = await getGraduateStudent(parent.id);
				let students = await getGraduateStudentbyUniversity(parent.id);
				students = offset ? students.slice(offset) : students;
    			students = limit ? students.slice(0, limit) : students;
				
				// taking clauses
				const {AND,advisor, university, age} = where || {};
				if(where)
				{
					students = await getGdStudentPlusAdvisorByUniID(parent.id);
					if(where.AND){
						for(let i = 0; i< where.AND.length; i ++){
							const {advisor, university, age} = where.AND[i] || {};
							if(advisor){
								let comment = {nr: parseInt(advisor.nr), criterion: advisor.researchInterest.criterion,pattern:advisor.researchInterest.pattern }
								if(comment.nr)
									students = resolveAdvisorNrField(students,comment)
								else if(comment.criterion)
									students = resolveAdvisorField(students,comment )
							}
							if(age){
								students = resolveAgeField(students,age )
							}
							if(university){
								students = resolveUniversityField(students,university);
							}
						}

					}else{
						const {advisor, university, age} = where || {};
						if(advisor){
							let comment = {nr: parseInt(advisor.nr), criterion: advisor.researchInterest.criterion,pattern:advisor.researchInterest.pattern }
							if(comment.nr)
								students = resolveAdvisorNrField(students,comment)
							else if(comment.criterion)
								students = resolveAdvisorField(students,comment )
						}
						else if(age){
							students = resolveAgeField(students,age )
						}
						else if(university){
							students = resolveUniversityField(students,university);
						}
					}
				}

				return students;
			},
			/*
			async undergraduateStudentConnection(parent, args, context, info)
			{
				let underGraduteStudents = await getUnderGraduateStudent(parent.id);
				return underGraduteStudents;
			},
			*/
			async graduateStudentConnection(parent, args, context, info)
			{
				//let GraduteStudents = await getGraduateStudent(parent.id);
				let GraduteStudents = await getGraduateStudentbyUniversity(parent.id);
				return GraduteStudents;
			},
			 departments(parent, args, context, info){
				let query = con.select().from('department').where('suborganizationof',parent.id);
				let result =  query.then(rows => rows.map(row => new Department(row)));

				return result;
			}
			

		},
		CollectionOfEdgesToUgStudents:{
			aggregate(parent, args, context, info){
				return {
					student: parent,
					studentCount: parent.length
				};
			}
		},
		AggregateUgStudents:{
			count(parent, args, context, info){
				return parent.studentCount;
			},
			age(parent, args, context, info){
				let studentAge = getUndergraduateStudentAge(parent.student);
				return {age: studentAge};
			}
		},
		AgeAggregationOfUgStudents:{
			sum(parent, args, context, info){
				return sumAge(parent.age);
			},
			avg(parent, args, context, info){
				return sumAge(parent.age)/ parent.age.length;
			},
			max(parent, args, context, info){
				return Math.max(...parent.age);
			},
			min(parent, args, context, info){
				
				return Math.min(...parent.age);
			},
		},
		Department:{
			id(parent, args, context, info){

				const {id} = parent
				return id
			},
			subOrganizationOf(parent, args, context, info){

				return{
					id: parent.subOrganizationOf,
					departmentNo : parent.id
				}
			},
			head(parent, args, context, info){
				//let query = con.select().from("professor").innerJoin('faculty','faculty.worksfor','=','professor.headof').where('professor.nr',parseInt(parent.id));
				let query = con.select().from("professor").innerJoin('faculty','faculty.nr','=','professor.nr').where('professor.headof',parseInt(parent.id));
				//let query = con.select().from("professor").where('professor.nr', parent.head);
				return query.then(rows => (rows.length >0) ? new Professor(rows[0]):null);
			},
			faculties(parent, args, context, info){
				//let = departmentId = parent.id
				//let query = con.select().from("faculty").innerJoin('department','faculty.worksfor','=','department.nr').where('faculty.worksfor',departmentId);
				let query = con.select().from("faculty").where('faculty.worksfor', parent.id);
				let result = query.then(rows => rows.map(row => new Fa(row)));
				return result;
			},
			professors(parent, args, context, info){
				
				let query = con.select().from("faculty").innerJoin('professor','professor.nr','=','faculty.nr').where('faculty.worksfor',parseInt(parent.id));
				let result = query.then(rows => rows.map(row => new Professor(row)));
				return result;
			},
			lecturers(parent, args, context, info){
				//let query = con.select().from("faculty").innerJoin('lecturer','lecturer.nr','=','faculty.nr').where('faculty.worksfor',worksFor);
				let query = con.select().from("faculty").innerJoin('lecturer','lecturer.nr','=','faculty.nr').where('faculty.worksfor', parent.id);
				let result = query.then(rows => rows.map(row => new Lecturer(row)));
				return result;
			},
			graduateStudents(parent, args, context, info){
				let query = con.select().from('graduatestudent').where('memberof',parent.id);
				let result = query.then(rows => rows.map(row => new GraduateStudent(row)));
			
				return result;
			},
			undergraduateStudents(parent, args, context, info){

				let query = con.select().from('undergraduatestudent').where('memberof',parent.id);
				let result = query.then(rows => rows.map(row => new UndergraduateStudent(row)));
			
				return result;
			}
		},
		ResearchGroup:{
			subOrgnizationOf(parent, args, context, info){
				//debugger
				//return parent
				return{
					id: parent.subOrganizationOf
				}
			}
		},
		GraduateStudent:{
			id(parent, args, context, info){
				
				const {id} = parent
				return parent.id;
			},
			emailAddress(parent, args, context, info){
				
				const {emailAddress} = parent
				return emailAddress;
			},
			age(parent, args, context, info){
				const {age} = parent
				return age;
			},
			telephone(parent, args, context, info){
				const {telephone} = parent
				return telephone;
			},
			memberOf(parent, args, context, info){
				let query = con.select().from("department").where('nr', parent.memberOf);
				let result =  query.then(rows => new Department(rows[0]))
				return result;
			},
			advisor(parent, args, context, info){
				// get professor data which are adviosr of graduate student
				let adviosrId = parent.advisor
				let query = con.select().from("faculty").innerJoin('professor','professor.nr' ,"=",'faculty.nr').where('professor.nr',adviosrId);
				let result =  query.then(rows => new Professor(rows[0]))
				
				return result
			},
			takeGraduateCourses(parent, args, context, info){
				let studentId = parent.id;
				let query = con.select().from("graduatestudenttakecourse").innerJoin('graduatecourse','graduatecourse.nr','=','graduatestudenttakecourse.graduatecourseid').where('graduatestudenttakecourse.graduatestudentid', studentId);
				let result = query.then(rows => rows.map(row => new GradudateCourse(row)));
				return result;
			},
			assistCourses(parent, args, context, info){
				let graduateStudentId  = parent.id;
				console.log(graduateStudentId);
				let query = con.select().from("undergraduatecourse").where('teachingassistant',graduateStudentId);
				let result = query.then(rows => rows.map(row => new UndergraduateCourses(row)));
				return result;
			}
		},
		UndergraduateStudent:{
			id(parent, args, context, info){
				const {id} = parent
				return parent.id;
			},
			emailAddress(parent, args, context, info){
				const {emailAddress} = parent
				return emailAddress;
			},
			age(parent, args, context, info){
				const {age} = parent
				return age;
			},
			telephone(parent, args, context, info){
				const {telephone} = parent
				return telephone;
			},
			
			memberOf(parent, args, context, info){
				
				let query = con.select().from("department").where('nr', parent.memberOf);
				let result =  query.then(rows => new Department(rows[0]))
				return result;
			},
			takeCourses(parent, args, context, info){
				let query = con.select().from("undergraduatestudenttakecourse").innerJoin('undergraduatecourse','undergraduatecourse.nr','=','undergraduatestudenttakecourse.undergraduatecourseid').where('undergraduatestudenttakecourse.undergraduatestudentid', parent.id);
				let result = query.then(rows => rows.map(row => new UndergraduateTakeCourses(row)));
				
				return result;
			}
		},
		Professor:{
			id(parent, args, context, info){
				const {id} = parent
				return id
			},
			telephone(parent, args, context, info){
				
				const {telephone} = parent
				return telephone
			},
			emailAddress(parent, args, context, info){
				const {emailAddress} = parent
				return emailAddress
			},
			researchInterest(parent, args, context, info){
				const {researchInterest} = parent
				return researchInterest
			},
			profType(parent, args, context, info){
				const {profType} = parent
				return profType
			},

			undergraduteDegreeFrom(parent, args, context, info){
				
				let query = con.select().from('university').where('nr',parent.undergraduteDegreeFrom);
				let result = query.then(rows => new University(rows[0]));
				return result;
			},
			masterDegreeFrom(parent, args, context, info){

				let query = con.select().from('university').where('nr',parent.masterDegreeFrom);
				let result = query.then(rows => new University(rows[0]));
				return result;
			},
			doctoralDegreeFrom(parent, args, context, info){
				
				let query = con.select().from('university').where('nr',parent.doctoralDegreeFrom);
				let result = query.then(rows => new University(rows[0]));
				return result;
			},
			worksFor(parent, args, context, info){
				
				let query = con.select().from('department').where('nr',parent.worksFor);
				let result = query.then(rows => new Department(rows[0]));
				return result;
			},
			teacherOfGraduateCourses(parent, args, context, info)
			{
				let query = con.select().from('graduatecourse').where('teacher',parent.id);
				let result = query.then(rows => rows.map(row => new GraduateCourse(row)));
				return result;
			},
			teacherOfUndergraduateCourses(parent, args, context, info){
				
				let query = con.select().from('undergraduatecourse').where('teacher',parent.id);
				let result = query.then(rows => rows.map(row => new UndergraduateCourses(row)));
				return result;
			},
			async publications(parent, {order}){
				
				let publicaitons = await getPublicationByAuthor(parent.id)
				
				const{field,direction} = order 	
				if(field && direction){
					publicaitons = order ? _.orderBy(publicaitons, field,direction) : publicaitons;
				}
				else if(field)
				//	publicaitons = resolvePublication(publicaitons,order);
					publicaitons = _.orderBy(publicaitons, field);					
				return publicaitons;
			},
			supervisedGraduateStudents(parent, args, context, info){

				let query = con.select().from('graduatestudent').where('graduatestudent.advisor',parent.id);
				let result = query.then(rows => rows.map(row => new GraduateStudent(row)));
				return result;
			},
			supervisedUndergraduateStudents(parent, args, context, info){
				let query = con.select().from('undergraduatestudent').where('undergraduatestudent.advisor',parent.id);
				let result = query.then(rows => rows.map(row => new GraduateStudent(row)));
				return result;
			}


		},
		
		
	};

	const resolveUniversityField = (students,universityId)=>{
		students = students.filter(student => student.undergraduatedegreefrom == parseInt(universityId.nr))
		return students;
	}
	const resolveAgeField = (students,comment)=>{

		const { criterion,pattern } = comment;
		switch (criterion) {
			case "MORETHAN":
				students = students.filter(student => student.age > pattern);
			  break;
			case "LESSTHAN":
				students = students.filter(student => student.age < pattern);
			  break;
			case "EQUALS":
				students = students.filter(student => student.age == pattern) ;
			  break;
			
		  }
		  return students;
	}

	const resolveAdvisorField = (students,comment)=>{

		const { nr, criterion,pattern } = comment;
		switch (criterion) {
			case "CONTAINS":
				students = students.filter(student => student.researchInterest.includes(pattern) );
			  break;
			case "START_WITH":
				students = students.filter(student => student.researchInterest.startsWith(pattern) );
			  break;
			case "END_WITH":
				students = students.filter(student => student.researchInterest.endsWith(pattern) ) ;
			  break;
			case "EQUALS":
				students = students.filter(student => student.researchInterest === pattern );
			  break;
		  }
	  
		  return students;

	};

	const getUndergraduateStudentAge = students => students.map(student => parseFloat(student.age));
	const sumAge = ages => ages.reduce((curr, accu) => curr + accu, 0);
	
	const resolveAdvisorNrField=(students,comment)=>{
		const { nr, criterion,pattern } = comment;
		//students = students.filter(student => student.profnr == nr);
		students = students.filter(student => student.advisor == nr);
		return students;

	};

	// resolve Publiaction
	const resolvePublication = (publicaitons, args) =>{

		if(args.field === "title"){
			publicaitons = resolvePublicationTitleField(publicaitons,args)
		}
		else if(args.field === "abstract" ){
			publicaitons = resolvePublicationAbstractField(publicaitons,args)
		}
		return publicaitons;
	}
	// publication title filed filter
	const resolvePublicationTitleField = (publications,comment)=>{
		const { criterion,pattern } = comment;
		switch (criterion) {
			case "CONTAINS":
				publications = publications.filter(publication => publication.title.includes(pattern) );
				break;
			case "START_WITH":
				publications = publications.filter(publication => publication.title.startsWith(pattern) );
				break;
			case "END_WITH":
				publications = publications.filter(publication => publication.title.endsWith(pattern) ) ;
				break;
			case "EQUALS":
				publications = publications.filter(publication => publication.title === pattern );
				break;
			}
		
		return publications;

	};
	

	// publication Abstract filed filter
	const resolvePublicationAbstractField = (publications,comment)=>{
		const { criterion,pattern } = comment;
		switch (criterion) {
			case "CONTAINS":
				publications = publications.filter(publication => publication.abstract.includes(pattern) );
				break;
			case "START_WITH":
				publications = publications.filter(publication => publication.abstract.startsWith(pattern) );
				break;
			case "END_WITH":
				publications = publications.filter(publication => publication.abstract.endsWith(pattern) ) ;
				break;
			case "EQUALS":
				publications = publications.filter(publication => publication.abstract === pattern );
				break;
			}
		
		return publications;

	};
	
module.exports = resolvers;