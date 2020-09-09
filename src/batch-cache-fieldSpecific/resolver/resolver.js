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

			faculty: async ( _ , {nr},context ) =>{

				let facultyId = parseInt(nr);
				let lecturer = await context.loaderGetLecturerById.load(facultyId);
				let professor = await context.loaderGetProfessorById.load(facultyId);
				let arr = (lecturer) ? lecturer[0]: professor[0];
				return  arr;
			},
			researchGroup:(_,{nr} ,context) => {
				return context.researchGroupLoader.load(parseInt(nr));
			},
			university(_,{nr},context){
				let universityId = parseInt(nr);
				return context.loaderGetUniversityById.load(universityId);
			},
			department(_,{nr},context){
				let departmentId = parseInt(nr);
				return context.loaderGetDepartmentsById.load(departmentId)
			},
			async publicationSearch(_,args,context  ){
				//publiaction loader
				let publicaitons = await context.loaderGetAllPublications.load('all');
				let result = resolvePublication(publicaitons, args);			
				return result

			},
			async graduateStudents( parent,{ where,  limit , order },context ){
				//graduate student loader
				let students = await context.loaderGetAllGraduateStudents.load('all')
				
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
			async lecturer(_,{nr},context){
				let lecturerId = parseInt(nr);
				let result = await context.loaderGetLecturerById.load(lecturerId)
				return  result?  result[0]: null	
				
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
				let teacherId = parent.id;
				return context.loaderGetGratudateCourseByTeacherIds.load(teacherId);
			},
			teacherOfUndergraduateCourses(parent, args, context, info){
				let teacherId = parent.id;
				return context.loaderGetUndergratudateCourseByTeacherIds.load(teacherId);
			},
			publications(parent, args, context, info){
				let mainAuthorId = parent.id;
				return context.loaderGetPublicationByAuthorId.load(mainAuthorId);
			},
			undergraduteDegreeFrom(parent, args, context, info){
				return context.lecturerLoaderDegreeFrom.load(parent.undergraduteDegreeFrom);
			},
			masterDegreeFrom(parent, args, context, info){
				return context.lecturerLoaderDegreeFrom.load(parent.masterDegreeFrom);
			},
			doctoralDegreeFrom(parent, args, context, info){
				return context.lecturerLoaderDegreeFrom.load(parent.doctoralDegreeFrom);
			},
			async worksFor(parent, args, context, info){
				return context.lecturerLoaderWorkFor.load(parent.worksFor)
			}
	
		},
		GraduateCourse:{
			teachedby(parent, args, context, info){
				return context.loaderGetFacultyById.load(parent.teacher)
			},
			graduateStudents(parent, args, context, info){
				return context.loaderGetGraduateStudentById.load(parent.graduatestudentid)
			},
		},
		UndergraduateCourse:{
			teachedby(parent, args, context, info){
				return context.loaderGetFacultyById.load(parent.teacher)
			},
			undergraduateStudents(parent, args, context, info){
				return context.loaderUndergraduateStudentById.load(parent.undergraduatestudentid);
			},
			teachingAssistants(parent, args, context, info){
				return context.loaderGetGraduateStudentById.load(parent.teachingassistant)
			}

			
		},
		Publication:{
			async authors(parent, args, context, info){
			
				let mainaAuthor = parent.mainauthor
				// data loader
				let lecturerPublications = await context.loaderGetLecturerById.load(mainaAuthor);
				let professorPublications = await context.loaderGetProfessorById.load(mainaAuthor);
				let graduateStudent = await context.loaderGetGraduateStudentPublication.load(parent.id)
				
				let arr = [...professorPublications,...lecturerPublications,...graduateStudent]
			
				 arr = arr.filter(function (el) {
					return el != null;
				  });

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
				return context.loaderfacultyGetUndergraduatedegreeFrom.load(parent.id)
			},
			mastergraduateDegreeObtainers(parent, args, context, info){
				return context.loaderfacultyGetmasterdegreeFrom.load(parent.id)
			},
			doctoralDegreeObtainers(parent,{where},context){
				let doctoralIds = parent.id;
				return context.loaderfacultyGetWorksfor.load({doctoralIds,where})
			},
			async undergraduateDegreeObtainedBystudent(parent,{ where , limit , offset },context){
				// get graduate student by university id dataloader method

				let students =  await context.loaderGetGraduateStudentByUniversityId.load(parent.id)
				
				students = offset ? students.slice(offset) : students;
    			students = limit ? students.slice(0, limit) : students;

    			if(where){
					students = await context.loadergetGraduateStudentByUniIdPlusAdvisor.load(parent.id);
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
				
				// taking clauses
				/*
				const {AND,advisor, university, age} = where || {};
				if(where)
				{
					const {AND,advisor, university, age} = where || {};
				}
				// if(AND){				
				// }
				
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
				}*/

				return students;
			},
			async graduateStudentConnection(parent, args, context, info)
			{
				let GraduteStudents = await context.loaderGetGraduateStudentByUniversityId.load(parent.id);
				return GraduteStudents;
			},
			departments(parent, args, context, info){
				let subOrganizationId = parent.id;
				return context.loaderGetDepartmentsBySuborganizationId.load(subOrganizationId);
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
			async head(parent, args, context, info){
				//dataloader for head of department
				//let result = await context.loaderGetHeadOfDepartment.load(parseInt(parent.id));
				let result = await context.loaderGetHeadOfDepartment.load(parent.id);
				return result?  result[0]: null	
			},
			faculties(parent, args, context, info){
				let departmentId = parseInt(parent.id);
				return context.loaderGetFacultiesByDepartmentId.load(departmentId)
			},
			professors(parent, args, context, info){
				let worksFor = parseInt(parent.id);
				return context.loaderGetProfessorByDepartmentId.load(worksFor);
			},
			lecturers(parent, args, context, info){
				let worksFor = parseInt(parent.id);
				return context.loaderGetLecturerByDepartmentId.load(worksFor);
			},
			graduateStudents(parent, args, context, info){
				let departmentId = parent.id;
				return context.loaderGetGraduateStudentDepartmentsById.load(departmentId)
			},
			undergraduateStudents(parent, args, context, info){				
				let departmentId = parent.id;
				return context.loaderGetUndergraduateStudentDepartmentsById.load(departmentId)
			}
		},
		ResearchGroup:{
			subOrgnizationOf(parent, args, context, info){
				return context.loaderDepartmentByResearchGroup.load(parent.subOrganizationOf);
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
				return context.loaderGraduateStudentMemberofById.load(parent.memberOf);
			},
			advisor(parent, args, context, info){
				// get professor data which are adviosr of graduate student
				let adviosrId = parent.advisor
				return context.loaderGraduateStudentAdvisorById.load(adviosrId);
			},
			takeGraduateCourses(parent, args, context, info){
				let studentId = parent.id;
				return context.loaderGraduateTakeCourses.load(studentId);
			},
			assistCourses(parent, args, context, info){
				let graduateStudentId  = parent.id;
				return context.loaderGraduateAssistCourses.load(graduateStudentId)
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
				let memberIds = parent.memberOf;
				return context.loaderUndergraduateStudentMemberofById.load(memberIds);
			},
			takeCourses(parent, args, context, info){
				let underGraduteStudentIds = parent.id;
				return context.loaderUndergraduateTakeCourses.load(underGraduteStudentIds);
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
				return context.professorLoaderDegreeFrom.load(parent.undergraduteDegreeFrom);
			},
			masterDegreeFrom(parent, args, context, info){
				return context.professorLoaderDegreeFrom.load(parent.masterDegreeFrom);
			},
			doctoralDegreeFrom(parent, args, context, info){
				return context.professorLoaderDegreeFrom.load(parent.doctoralDegreeFrom);
			},
			worksFor(parent, args, context, info){
				return context.professorLoaderWorkFor.load(parent.worksFor)
			},
			teacherOfGraduateCourses(parent, args, context, info)
			{
				let teacherId = parent.id;
				return context.loaderGetGratudateCourseByTeacherIds.load(teacherId);
			},
			teacherOfUndergraduateCourses(parent, args, context, info){
				let teacherId = parent.id;
				return context.loaderGetUndergratudateCourseByTeacherIds.load(teacherId);
			},
			async publications(parent, {order},context){
				
				let publicaitons = await context.loaderGetPublicationByAuthorId.load(parent.id)
				
				const{field,direction} = order 	|| {}
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
					publicaitons = resolvePublication(publicaitons,order);
			
				return publicaitons;
			},
			supervisedGraduateStudents(parent, args, context, info){
				let superviosIds = parent.id;
				return context.loaderGraduateStudentSuperviosrById.load(superviosIds);
			},
			supervisedUndergraduateStudents(parent, args, context, info){
				let superviosIds = parent.id;
				return context.loaderUndergraduateStudentSuperviosrById.load(superviosIds);
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
		students = students.filter(student => student.profnr == nr);
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