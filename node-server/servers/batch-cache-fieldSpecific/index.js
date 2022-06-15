///dotenv use to include .env file which is created on root file
require('dotenv').config();

const { ApolloServer } = require("apollo-server");

const resolvers = require("./resolver");
const typeDefs = require("./typeDefs");

const {researchGroupLoader, loaderDepartmentByResearchGroup} = require('./loaders/researchgroup');
const {lecturerLoaderDegreeFrom,lecturerLoaderWorkFor,loaderGetLecturerById} = require('./loaders/lecturer');
const {loaderGetPublicationByAuthorId,loaderGetAllPublications} = require('./loaders/publication');
const {loaderGetUndergratudateCourseByTeacherIds,loaderUndergraduateTakeCourses} = require('./loaders/undergraduatecourse');
const {loaderGetGratudateCourseByTeacherIds,loaderGraduateTakeCourses,loaderGraduateAssistCourses} = require('./loaders/graduatecourse');
const {professorLoaderDegreeFrom,professorLoaderWorkFor,loaderGetProfessorById} = require('./loaders/professor');
const {loaderGetDepartmentsBySuborganizationId,loaderGetDepartmentsById,loaderGetUndergraduateStudentDepartmentsById,loaderGetGraduateStudentDepartmentsById,loaderGetHeadOfDepartment} = require('./loaders/department');
const {loaderfacultyGetUndergraduatedegreeFrom,loaderfacultyGetmasterdegreeFrom,loaderfacultyGetWorksfor,loaderGetLecturerByDepartmentId,loaderGetProfessorByDepartmentId,loaderGetFacultiesByDepartmentId,loaderGetFacultyById} = require('./loaders/faculty');
const {loaderGraduateStudentSuperviosrById,loaderGraduateStudentMemberofById,loaderGraduateStudentAdvisorById,loaderGetAllGraduateStudents,loaderGetGraduateStudentById,loaderGetGraduateStudentByUniversityId,loaderGetGraduateStudentPublication,loadergetGraduateStudentByUniIdPlusAdvisor} = require('./loaders/graduatestudent');
const {loaderUndergraduateStudentSuperviosrById,loaderUndergraduateStudentMemberofById,loaderUndergraduateStudentById,loaderUndergetGraduateStudentByUniversityId} = require('./loaders/undergraduatestudent');
const {loaderGetUniversityById} = require('./loaders/university');
const server = new ApolloServer({ 
	typeDefs,
	resolvers,
	tracing: true,
	context :{
		researchGroupLoader: researchGroupLoader(),
		loaderDepartmentByResearchGroup: loaderDepartmentByResearchGroup(),
		lecturerLoaderDegreeFrom: lecturerLoaderDegreeFrom(),
		lecturerLoaderWorkFor: lecturerLoaderWorkFor(),
		loaderGetPublicationByAuthorId: loaderGetPublicationByAuthorId(),
		loaderGetUndergratudateCourseByTeacherIds: loaderGetUndergratudateCourseByTeacherIds(),
		loaderGetGratudateCourseByTeacherIds: loaderGetGratudateCourseByTeacherIds(),
		professorLoaderDegreeFrom : professorLoaderDegreeFrom(),
		professorLoaderWorkFor : professorLoaderWorkFor(),
		loaderGetDepartmentsBySuborganizationId : loaderGetDepartmentsBySuborganizationId(),
		loaderfacultyGetUndergraduatedegreeFrom : loaderfacultyGetUndergraduatedegreeFrom(),
		loaderfacultyGetmasterdegreeFrom:  loaderfacultyGetmasterdegreeFrom(),
		loaderfacultyGetWorksfor: loaderfacultyGetWorksfor(),
		loaderGetDepartmentsById: loaderGetDepartmentsById(),
		loaderGraduateStudentSuperviosrById: loaderGraduateStudentSuperviosrById(),
		loaderUndergraduateStudentSuperviosrById: loaderUndergraduateStudentSuperviosrById(),
		loaderUndergraduateStudentMemberofById:loaderUndergraduateStudentMemberofById(),
		loaderUndergraduateTakeCourses:loaderUndergraduateTakeCourses(),
		loaderGraduateStudentMemberofById:loaderGraduateStudentMemberofById(),
		loaderGraduateStudentAdvisorById:loaderGraduateStudentAdvisorById(),
		loaderGraduateTakeCourses:loaderGraduateTakeCourses(),
		loaderGraduateAssistCourses:loaderGraduateAssistCourses(),
		loaderGetUndergraduateStudentDepartmentsById:loaderGetUndergraduateStudentDepartmentsById(),
		loaderGetGraduateStudentDepartmentsById:loaderGetGraduateStudentDepartmentsById(),
		loaderGetLecturerByDepartmentId:loaderGetLecturerByDepartmentId(),
		loaderGetProfessorByDepartmentId:loaderGetProfessorByDepartmentId(),
		loaderGetFacultiesByDepartmentId:loaderGetFacultiesByDepartmentId(),
		loaderGetAllPublications:loaderGetAllPublications(),
		loaderGetAllGraduateStudents:loaderGetAllGraduateStudents(),
		loadergetGraduateStudentByUniIdPlusAdvisor:loadergetGraduateStudentByUniIdPlusAdvisor(),
		loaderGetUniversityById:loaderGetUniversityById(),
		loaderGetHeadOfDepartment:loaderGetHeadOfDepartment(),
		loaderGetFacultyById:loaderGetFacultyById(),
		loaderUndergraduateStudentById:loaderUndergraduateStudentById(),
		loaderGetGraduateStudentById:loaderGetGraduateStudentById(),
		loaderGetGraduateStudentByUniversityId:loaderGetGraduateStudentByUniversityId(),
		loaderUndergetGraduateStudentByUniversityId:loaderUndergetGraduateStudentByUniversityId(),
		loaderGetLecturerById:loaderGetLecturerById(),
		loaderGetProfessorById:loaderGetProfessorById(),
		loaderGetGraduateStudentPublication:loaderGetGraduateStudentPublication()
	}
});

server.listen().then(({ url }) => {
	console.log(`🚀 Server ready at ${url}`);
});



