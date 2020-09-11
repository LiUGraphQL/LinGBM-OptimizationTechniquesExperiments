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
				let lecturer = await context.repository.loaderGetLecturerById.get(facultyId);
				let professor = await context.repository.loaderGetProfessorById.get(facultyId);
				let arr = (lecturer) ? lecturer[0]: professor[0];
				return  arr;
			},
			researchGroup:(_,{nr} ,context) => {
				return context.repository.researchGroupLoader.get(parseInt(nr));
			},
			university(_,{nr},context){
				let universityId = parseInt(nr);
				return context.repository.loaderGetUniversityById.get(universityId);
			},
			department(_,{nr},context){
				let departmentId = parseInt(nr);
				return context.repository.loaderGetDepartmentsById.get(departmentId)
			},
			async publicationSearch(_,args,context  ){
				//publiaction loader
				let publicaitons = await context.repository.loaderGetAllPublications.all();
				let result = resolvePublication(publicaitons, args);			
				return result

			},
			async graduateStudents( parent,{ where,  limit , order },context ){
				//graduate student loader
				let students = await context.repository.loaderGetAllGraduateStudents.all()
				
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
				let result = await context.repository.loaderGetLecturerById.get(lecturerId)
				return  result?  result[0]: null	
				
			}
		},
		Lecturer:{
			teacherOfGraduateCourses(parent, args, context, info)
			{
				let teacherId = parent.id;
				return context.repository.loaderGetGratudateCourseByTeacherIds.get(teacherId);
			},
			teacherOfUndergraduateCourses(parent, args, context, info){
				let teacherId = parent.id;
				return context.repository.loaderGetUndergratudateCourseByTeacherIds.get(teacherId);
			},
			publications(parent, args, context, info){
				let mainAuthorId = parent.id;
				return context.repository.loaderGetPublicationByAuthorId.get(mainAuthorId);
			},
			undergraduteDegreeFrom(parent, args, context, info){
				return context.repository.lecturerLoaderDegreeFrom.get(parent.undergraduteDegreeFrom);
			},
			masterDegreeFrom(parent, args, context, info){
				return context.repository.lecturerLoaderDegreeFrom.get(parent.masterDegreeFrom);
			},
			doctoralDegreeFrom(parent, args, context, info){
				return context.repository.lecturerLoaderDegreeFrom.get(parent.doctoralDegreeFrom);
			},
			async worksFor(parent, args, context, info){
				return context.repository.lecturerLoaderWorkFor.get(parent.worksFor)
			}
	
		},
		GraduateCourse:{
			teachedby(parent, args, context, info){
				return context.repository.loaderGetFacultyById.get(parent.teacher)
			},
			graduateStudents(parent, args, context, info){
				return context.repository.loaderGetGraduateStudentById.get(parent.graduatestudentid)
			},
		},
		UndergraduateCourse:{
			teachedby(parent, args, context, info){
				return context.repository.loaderGetFacultyById.get(parent.teacher)
			},
			undergraduateStudents(parent, args, context, info){
				return context.repository.loaderUndergraduateStudentById.get(parent.undergraduatestudentid);
			},
			teachingAssistants(parent, args, context, info){
				return context.repository.loaderGetGraduateStudentById.get(parent.teachingassistant)
			}

			
		},
		Publication:{
			async authors(parent, args, context, info){
			
				let mainaAuthor = parent.mainauthor
				// data loader
				let lecturerPublications = await context.repository.loaderGetLecturerById.get(mainaAuthor);
				let professorPublications = await context.repository.loaderGetProfessorById.get(mainaAuthor);
				let graduateStudent = await context.repository.loaderGetGraduateStudentPublication.get(parent.id)
				
				let arr = [...professorPublications,...lecturerPublications,...graduateStudent]
			
				 arr = arr.filter(function (el) {
					return el != null;
				  });

				return arr;
			}
		},
		University:{
			undergraduateDegreeObtainedByFaculty(parent, args, context, info){
				return context.repository.loaderfacultyGetUndergraduatedegreeFrom.get(parent.id)
			},
			mastergraduateDegreeObtainers(parent, args, context, info){
				return context.repository.loaderfacultyGetmasterdegreeFrom.get(parent.id)
			},
			//doctoralDegreeObtainers(parent,{where},context){
			//	let doctoralIds = parent.id;
			//	return context.loaderfacultyGetWorksfor.get(doctoralIds,where)
			//},
			doctoralDegreeObtainers(parent,{where}, context){
				let result = "";
				if(where)
					result = context.repository.loaderfacultyGetWorksfor.get(parent.id,where);
				else
					result = context.repository.loaderfacultyGetDoctordegreeFrom.get(parent.id);
				return result;
			},
			async undergraduateDegreeObtainedBystudent(parent,{ where , limit , offset },context){
				// get graduate student by university id dataloader method

				let students =  await context.repository.loaderGetGraduateStudentByUniversityId.get(parent.id)
				
				students = offset ? students.slice(offset) : students;
    			students = limit ? students.slice(0, limit) : students;

    			if(where){
					students = await context.repository.loadergetGraduateStudentByUniIdPlusAdvisor.get(parent.id);
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
				let GraduteStudents = await context.repository.loaderGetGraduateStudentByUniversityId.get(parent.id);
				return GraduteStudents;
			},
			departments(parent, args, context, info){
				let subOrganizationId = parent.id;
				return context.repository.loaderGetDepartmentsBySuborganizationId.get(subOrganizationId);
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

				return{
					id: parent.subOrganizationOf,
					departmentNo : parent.id
				}
			},
			async head(parent, args, context, info){
				//dataloader for head of department
				//let result = await context.loaderGetHeadOfDepartment.load(parseInt(parent.id));
				let result = await context.repository.loaderGetHeadOfDepartment.get(parent.id);
				return result?  result[0]: null	
			},
			faculties(parent, args, context, info){
				let departmentId = parseInt(parent.id);
				return context.repository.loaderGetFacultiesByDepartmentId.get(departmentId)
			},
			professors(parent, args, context, info){
				let worksFor = parseInt(parent.id);
				return context.repository.loaderGetProfessorByDepartmentId.get(worksFor);
			},
			lecturers(parent, args, context, info){
				let worksFor = parseInt(parent.id);
				return context.repository.loaderGetLecturerByDepartmentId.get(worksFor);
			},
			graduateStudents(parent, args, context, info){
				let departmentId = parent.id;
				return context.repository.loaderGetGraduateStudentDepartmentsById.get(departmentId)
			},
			undergraduateStudents(parent, args, context, info){				
				let departmentId = parent.id;
				return context.repository.loaderGetUndergraduateStudentDepartmentsById.get(departmentId)
			}
		},
		ResearchGroup:{
			subOrgnizationOf(parent, args, context, info){
				/*
				return{
					id: parent.subOrganizationOf
				}
				*/
				return context.repository.loaderDepartmentByResearchGroup.get(parent.subOrganizationOf);
			}
		},
		GraduateStudent:{
			memberOf(parent, args, context, info){
				return context.repository.loaderGraduateStudentMemberofById.get(parent.memberOf);
			},
			advisor(parent, args, context, info){
				// get professor data which are adviosr of graduate student
				let adviosrId = parent.advisor
				return context.repository.loaderGraduateStudentAdvisorById.get(adviosrId);
			},
			takeGraduateCourses(parent, args, context, info){
				let studentId = parent.id;
				return context.repository.loaderGraduateTakeCourses.get(studentId);
			},
			assistCourses(parent, args, context, info){
				let graduateStudentId  = parent.id;
				return context.repository.loaderGraduateAssistCourses.get(graduateStudentId)
			}
		},
		UndergraduateStudent:{
			
			memberOf(parent, args, context, info){
				let memberIds = parent.memberOf;
				return context.repository.loaderUndergraduateStudentMemberofById.get(memberIds);
			},
			takeCourses(parent, args, context, info){
				let underGraduteStudentIds = parent.id;
				return context.repository.loaderUndergraduateTakeCourses.get(underGraduteStudentIds);
			}
		},
		Professor:{
			undergraduteDegreeFrom(parent, args, context, info){
				return context.repository.professorLoaderDegreeFrom.get(parent.undergraduteDegreeFrom);
			},
			masterDegreeFrom(parent, args, context, info){
				return context.repository.professorLoaderDegreeFrom.get(parent.masterDegreeFrom);
			},
			doctoralDegreeFrom(parent, args, context, info){
				return context.repository.professorLoaderDegreeFrom.get(parent.doctoralDegreeFrom);
			},
			worksFor(parent, args, context, info){
				return context.repository.professorLoaderWorkFor.get(parent.worksFor)
			},
			teacherOfGraduateCourses(parent, args, context, info)
			{
				let teacherId = parent.id;
				return context.repository.loaderGetGratudateCourseByTeacherIds.get(teacherId);
			},
			teacherOfUndergraduateCourses(parent, args, context, info){
				let teacherId = parent.id;
				return context.repository.loaderGetUndergratudateCourseByTeacherIds.get(teacherId);
			},
			async publications(parent, {order},context){
				
				let publicaitons = await context.repository.loaderGetPublicationByAuthorId.get(parent.id)
				
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
				return context.repository.loaderGraduateStudentSuperviosrById.get(superviosIds);
			},
			supervisedUndergraduateStudents(parent, args, context, info){
				let superviosIds = parent.id;
				return context.repository.loaderUndergraduateStudentSuperviosrById.get(superviosIds);
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
