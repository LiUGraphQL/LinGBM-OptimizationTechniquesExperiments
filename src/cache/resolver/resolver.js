const con = require("../database/db");
var rp = require('request-promise');
const DataLoader = require('dataloader')
const cache =  require("../config")
const { simpleSortRows, allGeneric, memoize } = require('../helpers');
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

const resolvers = {
		
	Faculty:{
		
		__resolveType:(parent, context, repository) => {
			
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
			__resolveType(obj,context,repository)
			{

				console.log("obj:",obj);
				return null;
			}
		},
		Author:{
			__resolveType(parent, context, repository)
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
			
			faculty: async ( _ , {nr}, {repository}) =>{
			
				let lecturer = await repository.faculty.memoizeGetFacultyLecturer(parseInt(nr));
				let professor = await repository.faculty.memoizeGetFacultyProfessor(parseInt(nr));
				let arr = (lecturer) ? lecturer: professor;
				return  arr;
			},
			researchGroup:(_,{nr}, {repository}) => {
				let result = repository.researchGroup.memoizeGetResearchGroupById(nr)
				return result
			},
			university(_,{nr}, {repository}){
				let result = repository.university.memoizeGetUniversityById(parseInt(nr))
				return result;
			},
			department(_,{nr}, {repository}){
				let result = repository.department.memoizeGetDepartmentById(parseInt(nr))
				return result;
			},
			async publicationSearch(_,args, {repository}){
				
				let publicaitons = await repository.publication.memoizeGetPublication()
				let result = resolvePublication(publicaitons, args);
				console.log("result : ",result)
				
				return result

			},
			async graduateStudents( parent,{ where,  limit , order }, {repository}){

				let students = await repository.graduateStudent.memoizeGetAllGraduateStudent()

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
			lecturer(_,{nr}, {repository}){

				let lecturerId = parseInt(nr);				
				let result = repository.lecturer.memoizeGetLecturerById(lecturerId)
				return result
				
			}


			
		},
		Lecturer:{
			teacherOfGraduateCourses(parent, args, context, info)
			{
				//let query = con.select().from('graduatecourse').where('teacher',parent.id);
				//let result = query.then(rows => rows.map(row => new GraduateCourse(row)));
				let result = context.repository.graduateCourse.memoizeGetGradCoursesByFacultyID(parent.id);
				return result;
			},
			teacherOfUndergraduateCourses(parent, args, context, info){
				//let query = con.select().from('undergraduatecourse').where('teacher',parent.id);
				//let result = query.then(rows => rows.map(row => new UndergraduateCourses(row)));
				let result = context.repository.undergratudateCourse.memoizeGetUngradCoursesByFacultyID(parent.id);
				return result;
			},
			publications(parent, args, context, info){
				let result = context.repository.publication.memoizeGetPublicationByAuthor(parent.id)
				return result;
			},
			undergraduateDegreeFrom(parent, args, context, info){
				//let query = con.select().from('university').where('nr',parent.undergraduatedegreeFrom);
				//let result = query.then(rows => new University(rows[0]));
				let result = context.repository.university.memoizeGetUniversityById(parent.undergraduateDegreeFrom);
				return result;
			},
			masterDegreeFrom(parent, args, context, info){	
				//let query = con.select().from('university').where('nr',parent.masterDegreeFrom);
				//let result = query.then(rows => new University(rows[0]));
				let result = context.repository.university.memoizeGetUniversityById(parent.masterDegreeFrom);
				return result;
			},
			doctoralDegreeFrom(parent, args, context, info){
				//let query = con.select().from('university').where('nr',parent.doctoralDegreeFrom);
				//let result = query.then(rows => new University(rows[0]));
				let result = context.repository.university.memoizeGetUniversityById(parent.doctoralDegreeFrom);
				return result;
			},
			worksFor(parent, args, context, info){
				//let query = con.select().from('department').where('nr',parent.worksFor);
				//let result = query.then(rows => new Department(rows[0]));
				let result = context.repository.department.memoizeGetDepartmentById(parent.worksFor);
				return result;
			}
			
			
			
		},
		GraduateCourse:{
			teachedby(parent, args, context, info){
				//let query = con.select().from("faculty").where('nr',parent.teacher);
				//return  query.then(rows => new Fa(rows[0]))
				let result = context.repository.faculty.memoizeGetFacultyById(parent.teacher);
				return result;
			},
			graduateStudents(parent, args, context, info){
				//let query = query = con.select().from('graduatestudent').whereIn('nr',parent.graduatestudentid);
				//let result = query.then(rows => rows.map(row => new GraduateStudent(row)));
				let result = context.repository.graduateStudent.memoizeGetGraStudentByCourseID(parent.id)
				return result;
			},
		},
		UndergraduateCourse:{
			teachedby(parent, args, context, info){
				//let query = con.select().from("faculty").where('nr',parent.teacher);
				//return  query.then(rows => new Fa(rows[0]))
				let result = context.repository.faculty.memoizeGetFacultyById(parent.teacher);
				return result;
			},
			undergraduateStudents(parent, args, context, info){
				//let query  = con.select().from('undergraduatestudent').where('nr',parent.undergraduatestudentid);
				//return  query.then(rows => rows.map(row => new Fa(row)));
				let result = context.repository.undergraduateStudent.memoizeGetUndergraStudentByCourseID(parent.id);
				return result;
			},
			teachingAssistants(parent, args, context, info){
				//let query = con.select().from('graduatestudent').where('nr',parent.teachingassistants);
				//let result =  query.then(rows => new GraduateStudent(rows[0]))
				let result = context.repository.graduateStudent.memoizeGetGraduateStudentById(parent.teachingassistants);
				return result;
			}

			
		},
		Publication:{
			async authors(parent, args, context, info){
				
				let professorPublications = await context.repository.faculty.memoizeGetFacultyProfessor(parent.mainauthor);
				let lecturerPublications = await context.repository.faculty.memoizeGetFacultyLecturer(parent.mainauthor);
				let graduateStudent = await getGraduateStudentPublications(parent.id)
				let arr = [professorPublications,lecturerPublications,...graduateStudent]
				 arr = arr.filter(function (el) {
					return el != null;
				  });
				 
				console.log("result : ",arr)

				return arr;
			}
		},
		University:{
			undergraduateDegreeObtainedByFaculty(parent, args, context, info){
				//let query = con.select().from('faculty').where('undergraduatedegreefrom',parent.id);
				//let result = query.then(rows => rows.map(row => new Fa(row)));
				let result = context.repository.faculty.memoizeGetBachlorObtainerbyUniverId(parent.id);
				return result;
			},
			mastergraduateDegreeObtainers(parent, args, context, info){
				//let query = con.select().from('faculty').where('masterdegreefrom',parent.id);
				//let result = query.then(rows => rows.map(row => new Fa(row)));
				let result = context.repository.faculty.memoizeGetMasterObtainerbyUniverId(parent.id);
				return result;
			},
			doctoralDegreeObtainers(parent,{where}, {repository}){
				let result = "";
				if(where)
					result = repository.faculty.memoizeGetDoctoralDegreeByWorkFor(parent.id,where.worksFor.nr)
				else
					result = repository.faculty.memoizeGetDoctoralDegreeById(parent.id);
				return result;
			},
			async undergraduateDegreeObtainedBystudent(parent,{ where , limit , offset }, {repository}){
				
				let students = await repository.graduateStudent.memoizeGetGraduateStudent(parent.id)
				
				students = offset ? students.slice(offset) : students;
    			students = limit ? students.slice(0, limit) : students;
				
				// taking clauses
				if(where){
					students = await repository.graduateStudent.memoizeGetGraduateStudentPlusAdvisor(parent.id)
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
				}else{
					students = students;
				}

				return students;
			},
			//async undergraduateStudentConnection(parent, args, context, info)
			async graduateStudentConnection(parent, args, context, info)
			{
				let GraduteStudents = await context.repository.graduateStudent.memoizeGetGraduateStudent(parent.id);
				return GraduteStudents;
			},
			departments(parent, args, context, info){
				//let query = con.select().from('department').where('suborganizationof',parent.id);
				//let result =  query.then(rows => rows.map(row => new Department(row)));
				let result = context.repository.department.memoizeGetDepartmentByUniverId(parent.id);
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
				let studentAge = getgraduateStudentAge(parent.student);
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
			subOrganizationOf(parent, args, context, info){
				let result = context.repository.university.memoizeGetUniversityById(parent.subOrganizationOf);
				return result;
			},
			head(parent, args, context, info){
				let result = context.repository.professor.memoizeGetDepartmentHeadById(parent.id)
				return result
			},
			faculties(parent, args, context, info){
				//let = departmentId = parent.id
				//let result = memoizeGetDepartmentByFacultyId(departmentId)
				let result = context.repository.faculty.memoizeGetDepartmentByFacultyId(parent.id)
				return result;
			},
			professors(parent, args, context, info){
				//let query = con.select().from("faculty").innerJoin('professor','professor.nr','=','faculty.nr').where('faculty.worksfor',parseInt(parent.id));
				//let result = query.then(rows => rows.map(row => new Professor(row)));
				let result = context.repository.professor.memoizegGetProfessorbyDepartmentId(parent.id)
				return result;
			},
			lecturers(parent, args, context, info){
				//let query = con.select().from("faculty").innerJoin('lecturer','lecturer.nr','=','faculty.nr').where('faculty.worksfor', parent.id);
				//let result = query.then(rows => rows.map(row => new Lecturer(row)));
				let result = context.repository.lecturer.memoizeGetLecturerbyDepartmentId(parent.id)
				return result;
			},
			graduateStudents(parent, args, context, info){
				//let query = con.select().from('graduatestudent').where('memberof',parent.id);
				//let result = query.then(rows => rows.map(row => new GraduateStudent(row)));
				let result = context.repository.graduateStudent.memoizeGetGradStudentbyDepID(parent.id)
				return result;
			},
			undergraduateStudents(parent, args, context, info){
				//let query = con.select().from('undergraduatestudent').where('memberof',parent.id);
				//let result = query.then(rows => rows.map(row => new UndergraduateStudent(row)));
				let result = context.repository.undergraduateStudent.memoizeGetUndergradStudentbyDepID(parent.id)
				return result;
			}
		},
		ResearchGroup:{
			
			subOrganizationOf(parent, args, context, info){
				//return parent
				let result =  context.repository.department.memoizeGetDepartmentById(parent.subOrganizationOf);
				return result; 
			}
		},
		GraduateStudent:{
			memberOf(parent, args, context, info){
				let result =  context.repository.department.memoizeGetDepartmentById(parent.memberOf);	
				return result;
			},
			advisor(parent, args, context, info){
				
				// get professor data which are adviosr of graduate student
				let adviosrId = parent.advisor
				let result =  context.repository.professor.memoizegGetProfessorById(adviosrId)
				return result
			},
			takeGraduateCourses(parent, args, context, info){

				let studentId = parent.id;	
				let result = context.repository.graduateCourse.memoizeGetGraduateStudentTakeCourses(studentId)
				return result;
			},
			assistCourses(parent, args, context, info){
				let graduateStudentId  = parent.id;
				//let query = con.select().from("undergraduatecourse").where('teachingassistant',graduateStudentId);
				//let result = query.then(rows => rows.map(row => new UndergraduateCourses(row)));
				let result =  context.repository.undergratudateCourse.memoizeGetUngradCourseByAssistantID(graduateStudentId);
				return result;
			}
		},
		UndergraduateStudent:{
			
			memberOf(parent, args, context, info){
				//let query = con.select().from("department").where('nr', parent.memberOf);
				//let result =  query.then(rows => new Department(rows[0]))
				let result = context.repository.department.memoizeGetDepartmentById(parent.memberOf);
				return result;
			},
			takeCourses(parent, args, context, info){
				//let query = con.select().from("undergraduatestudenttakecourse").innerJoin('undergraduatecourse','undergraduatecourse.nr','=','undergraduatestudenttakecourse.undergraduatecourseid').where('undergraduatestudenttakecourse.undergraduatestudentid', parent.id);
				//let result = query.then(rows => rows.map(row => new UndergraduateTakeCourses(row)));
				let result = context.repository.undergratudateCourse.memoizeGetUndergradCoursesByStudentID(parent.id);
				return result;
			}
		},
		Professor:{
			undergraduateDegreeFrom(parent, args, context, info){
				
				//let query = con.select().from('university').where('nr',parent.undergraduatedegreeFrom);
				//let result = query.then(rows => new University(rows[0]));
				let result = context.repository.university.memoizeGetUniversityById(parent.undergraduateDegreeFrom);
				return result;
			},
			masterDegreeFrom(parent, args, context, info){
				
				//let query = con.select().from('university').where('nr',parent.masterDegreeFrom);
				//let result = query.then(rows => new University(rows[0]));
				let result = context.repository.university.memoizeGetUniversityById(parent.masterDegreeFrom);
				return result;
			},
			doctoralDegreeFrom(parent, args, context, info){
				//let query = con.select().from('university').where('nr',parent.doctoralDegreeFrom);
				//let result = query.then(rows => new University(rows[0]));
				let result = context.repository.university.memoizeGetUniversityById(parent.doctoralDegreeFrom);
				return result;
			},
			worksFor(parent, args, context, info){
				let result = context.repository.department.memoizeGetDepartmentById(parent.worksFor)
				return result;
			},
			teacherOfGraduateCourses(parent, args, context, info)
			{
				//let query = con.select().from('graduatecourse').where('teacher',parent.id);
				//let result = query.then(rows => rows.map(row => new GraduateCourse(row)));
				let result = context.repository.graduateCourse.memoizeGetGradCoursesByFacultyID(parent.id)
				return result;
			},
			teacherOfUndergraduateCourses(parent, args, context, info){
				
				//let query = con.select().from('undergraduatecourse').where('teacher',parent.id);
				//let result = query.then(rows => rows.map(row => new UndergraduateCourses(row)));
				let result = context.repository.undergratudateCourse.memoizeGetUngradCoursesByFacultyID(parent.id)
				return result;
			},
			async publications(parent, {order}, {repository}){
				
				let publicaitons = await repository.publication.memoizeGetPublicationByAuthor(parent.id)
				
				const{field,direction} = order 	
				let directionLowCase
				if(direction === 'DESC'){
					directionLowCase = "desc";
				}else{
					directionLowCase = "asc";
				}

				if(field && direction){
					publicaitons = order ? _.orderBy(publicaitons, field,directionLowCase) : publicaitons;
				}
				else if(field)
					//publicaitons = resolvePublication(publicaitons,order);
					publicaitons = _.orderBy(publicaitons, field);					
				return publicaitons;
			},
			supervisedGraduateStudents(parent, args, context, info){

				//let query = con.select().from('graduatestudent').where('graduatestudent.advisor',parent.id);
				//let result = query.then(rows => rows.map(row => new GraduateStudent(row)));
				let result = context.repository.graduateStudent.memoizeGetGdStudentByAdvisorID(parent.id)
				return result;
			},
			supervisedUndergraduateStudents(parent, args, context, info){
				//let query = con.select().from('undergraduatestudent').where('undergraduatestudent.advisor',parent.id);
				//let result = query.then(rows => rows.map(row => new GraduateStudent(row)));
				let result = context.repository.undergraduateStudent.memoizeGetUndergdStudentByAdvisorID(parent.id)
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

	const getgraduateStudentAge = students => students.map(student => parseFloat(student.age));
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

