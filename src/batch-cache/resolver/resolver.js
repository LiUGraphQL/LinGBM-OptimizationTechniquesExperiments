const con = require("../database/db");
var rp = require('request-promise');
const DataLoader = require('dataloader')
const cache =  require("../config")
const {simpleSortRows, allGeneric } = require('../helpers');
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
				let lecturer = await context.repository.lecturer.loaderGetLecturerById(facultyId);
				let professor = await context.repository.professor.loaderGetProfessorById(facultyId);
				let arr = (lecturer) ? lecturer[0]: professor[0];
				return  arr;
			},
			researchGroup:(_,{nr} ,context) => {
				return context.repository.researchGroup.researchGroupLoader(parseInt(nr));
			},
			university(_,{nr},context){
				let universityId = parseInt(nr);
				return context.repository.university.loaderGetUniversityById(universityId);
			},
			department(_,{nr},context){
				let departmentId = parseInt(nr);
				return context.repository.department.loaderGetDepartmentsById(departmentId)
			},
			async publicationSearch(_,args,context  ){
				//publiaction loader
				let publicaitons = await context.repository.publication.loaderGetAllPublications();
				let result = resolvePublication(publicaitons, args);			
				return result

			},
			async graduateStudents( parent,{ where,  limit , order },context ){
				//graduate student loader
				let students = await context.repository.graduateStudent.loaderGetAllGraduateStudents()
				
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
				let result = await context.repository.lecturer.loaderGetLecturerById(lecturerId)
				return  result?  result[0]: null	
				
			}
		},
		Lecturer:{
			teacherOfGraduateCourses(parent, args, context, info)
			{
				let teacherId = parent.id;
				return context.repository.graduateCourse.loaderGetGratudateCourseByTeacherIds(teacherId);
			},
			teacherOfUndergraduateCourses(parent, args, context, info){
				let teacherId = parent.id;
				return context.repository.undergratudateCourse.loaderGetUndergratudateCourseByTeacherIds(teacherId);
			},
			publications(parent, args, context, info){
				let mainAuthorId = parent.id;
				return context.repository.publication.loaderGetPublicationByAuthorId(mainAuthorId);
			},
			undergraduateDegreeFrom(parent, args, context, info){
				return context.repository.university.loaderGetUniversityById(parent.undergraduateDegreeFrom);
			},
			masterDegreeFrom(parent, args, context, info){
				return context.repository.university.loaderGetUniversityById(parent.masterDegreeFrom);
			},
			doctoralDegreeFrom(parent, args, context, info){
				return context.repository.university.loaderGetUniversityById(parent.doctoralDegreeFrom);
			},
			async worksFor(parent, args, context, info){
				return context.repository.lecturer.lecturerLoaderWorkFor(parent.worksFor)
			}
		},
		GraduateCourse:{
			teachedby(parent, args, context, info){
				return context.repository.faculty.loaderGetFacultyById(parent.teacher)
			},
			graduateStudents(parent, args, context, info){
				return context.repository.graduateStudent.loaderGetGraduateStudentById(parent.graduatestudentid)
			},
		},
		UndergraduateCourse:{
			teachedby(parent, args, context, info){
				return context.repository.faculty.loaderGetFacultyById(parent.teacher)
			},
			undergraduateStudents(parent, args, context, info){
				return context.repository.undergraduateStudent.loaderUndergraduateStudentById(parent.undergraduatestudentid);
			},
			teachingAssistants(parent, args, context, info){
				return context.repository.graduateStudent.loaderGetGraduateStudentById(parent.teachingassistant)
			}

			
		},
		Publication:{
			async authors(parent, args, context, info){
			
				let mainaAuthor = parent.mainauthor
				// data loader
				let lecturerPublications = await context.repository.lecturer.loaderGetLecturerById(mainaAuthor);
				let professorPublications = await context.repository.professor.loaderGetProfessorById(mainaAuthor);
				let graduateStudent = await context.repository.graduateStudent.loaderGetGraduateStudentPublication(parent.id)
				
				let arr = [...professorPublications,...lecturerPublications,...graduateStudent]
			
				 arr = arr.filter(function (el) {
					return el != null;
				  });

				return arr;
			}
		},
		University:{
			undergraduateDegreeObtainedByFaculty(parent, args, context, info){
				return context.repository.faculty.loaderfacultyGetUndergraduatedegreeFrom(parent.id)
			},
			mastergraduateDegreeObtainers(parent, args, context, info){
				return context.repository.faculty.loaderfacultyGetmasterdegreeFrom(parent.id)
			},
			doctoralDegreeObtainers(parent,{where},context){
				let doctoralIds = parent.id;
				//return context.loaderfacultyGetWorksfor.load({doctoralIds,where})
				return context.repository.faculty.loaderfacultyGetWorksfor({doctoralIds,where});
			},
			async undergraduateDegreeObtainedBystudent(parent,{ where , limit , offset },context){
				// get graduate student by university id dataloader method

				let students =  await context.repository.graduateStudent.loaderGetGraduateStudentByUniversityId(parent.id)
				
				students = offset ? students.slice(offset) : students;
    			students = limit ? students.slice(0, limit) : students;

    			if(where){
					students = await context.repository.graduateStudent.loadergetGraduateStudentByUniIdPlusAdvisor(parent.id);
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
			async graduateStudentConnection(parent, args, context, info)
			{
				let GraduteStudents = await context.repository.graduateStudent.loaderGetGraduateStudentByUniversityId(parent.id);
				return GraduteStudents;
			},
			departments(parent, args, context, info){
				let subOrganizationId = parent.id;
				return context.repository.department.loaderGetDepartmentsBySuborganizationId(subOrganizationId);
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
				let result = await context.repository.faculty.loaderGetHeadOfDepartment(parent.id);
				return result?  result[0]: null	
			},
			faculties(parent, args, context, info){
				let departmentId = parseInt(parent.id);
				return context.repository.faculty.loaderGetFacultiesByDepartmentId(departmentId)
			},
			professors(parent, args, context, info){
				let worksFor = parseInt(parent.id);
				return context.repository.professor.loaderGetProfessorByDepartmentId(worksFor);
			},
			lecturers(parent, args, context, info){
				let worksFor = parseInt(parent.id);
				return context.repository.lecturer.loaderGetLecturerByDepartmentId(worksFor);
			},
			graduateStudents(parent, args, context, info){
				let departmentId = parent.id;
				return context.repository.graduateStudent.loaderGetGraduateStudentDepartmentsById(departmentId)
			},
			undergraduateStudents(parent, args, context, info){				
				let departmentId = parent.id;
				return context.repository.undergraduateStudent.loaderGetUndergraduateStudentDepartmentsById(departmentId)
			}
		},
		ResearchGroup:{
			subOrganizationOf(parent, args, context, info){
				/*
				return{
					id: parent.subOrganizationOf
				}
				*/
				return context.repository.department.loaderGetDepartmentsById(parent.subOrganizationOf);
			}
		},
		GraduateStudent:{
			memberOf(parent, args, context, info){
				return context.repository.department.loaderGetDepartmentsById(parent.memberOf);
			},
			advisor(parent, args, context, info){
				// get professor data which are adviosr of graduate student
				let adviosrId = parent.advisor
				return context.repository.faculty.loaderGetFacultyById(adviosrId);
			},
			takeGraduateCourses(parent, args, context, info){
				let studentId = parent.id;
				return context.repository.graduateCourse.loaderGraduateTakeCourses(studentId);
			},
			assistCourses(parent, args, context, info){
				let graduateStudentId  = parent.id;
				return context.repository.graduateCourse.loaderGraduateAssistCourses(graduateStudentId)
			}
		},
		UndergraduateStudent:{
			
			memberOf(parent, args, context, info){
				let memberIds = parent.memberOf;
				return context.repository.department.loaderGetDepartmentsById(memberIds);
			},
			takeCourses(parent, args, context, info){
				let underGraduteStudentIds = parent.id;
				return context.repository.undergratudateCourse.loaderUndergraduateTakeCourses(underGraduteStudentIds);
			}
		},
		Professor:{
			undergraduateDegreeFrom(parent, args, context, info){
				return context.repository.university.loaderGetUniversityById(parent.undergraduateDegreeFrom);
			},
			masterDegreeFrom(parent, args, context, info){
				return context.repository.university.loaderGetUniversityById(parent.masterDegreeFrom);
			},
			doctoralDegreeFrom(parent, args, context, info){
				return context.repository.university.loaderGetUniversityById(parent.doctoralDegreeFrom);
			},
			worksFor(parent, args, context, info){
				return context.repository.department.loaderGetDepartmentsById(parent.worksFor)
			},
			teacherOfGraduateCourses(parent, args, context, info)
			{
				let teacherId = parent.id;
				return context.repository.graduateCourse.loaderGetGratudateCourseByTeacherIds(teacherId);
			},
			teacherOfUndergraduateCourses(parent, args, context, info){
				let teacherId = parent.id;
				return context.repository.undergratudateCourse.loaderGetUndergratudateCourseByTeacherIds(teacherId);
			},
			async publications(parent, {order},context){
				
				let publicaitons = await context.repository.publication.loaderGetPublicationByAuthorId(parent.id)
				
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
				return context.repository.graduateStudent.loaderGraduateStudentSuperviosrById(superviosIds);
			},
			supervisedUndergraduateStudents(parent, args, context, info){
				let superviosIds = parent.id;
				return context.repository.undergraduateStudent.loaderUndergraduateStudentSuperviosrById(superviosIds);
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
