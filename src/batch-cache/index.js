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
const {loaderfacultyGetUndergraduatedegreeFrom,loaderfacultyGetmasterdegreeFrom,loaderfacultyGetWorksfor,loaderGetLecturerByDepartmentId,loaderGetProfessorByDepartmentId,loaderGetFacultiesByDepartmentId,loaderGetFacultyById, loaderfacultyGetDoctordegreeFrom} = require('./loaders/faculty');
const {loaderGraduateStudentSuperviosrById,loaderGraduateStudentMemberofById,loaderGraduateStudentAdvisorById,loaderGetAllGraduateStudents,loaderGetGraduateStudentById,loaderGetGraduateStudentByUniversityId,loaderGetGraduateStudentPublication,loadergetGraduateStudentByUniIdPlusAdvisor} = require('./loaders/graduatestudent');
const {loaderUndergraduateStudentSuperviosrById,loaderUndergraduateStudentMemberofById,loaderUndergraduateStudentById,loaderUndergetGraduateStudentByUniversityId} = require('./loaders/undergraduatestudent');
const {loaderGetUniversityById} = require('./loaders/university');
const server = new ApolloServer({ 
	typeDefs,
	resolvers,
	tracing: true,
	context :{
		loaderfacultyGetDoctordegreeFrom: new loaderfacultyGetDoctordegreeFrom(),
		researchGroupLoader: new researchGroupLoader(),
		loaderDepartmentByResearchGroup: new loaderDepartmentByResearchGroup(),
		lecturerLoaderDegreeFrom: new lecturerLoaderDegreeFrom(),
		lecturerLoaderWorkFor: new lecturerLoaderWorkFor(),
		loaderGetPublicationByAuthorId: new loaderGetPublicationByAuthorId(),
		loaderGetUndergratudateCourseByTeacherIds: new loaderGetUndergratudateCourseByTeacherIds(),
		loaderGetGratudateCourseByTeacherIds: new loaderGetGratudateCourseByTeacherIds(),
		professorLoaderDegreeFrom : new professorLoaderDegreeFrom(),
		professorLoaderWorkFor : new professorLoaderWorkFor(),
		loaderGetDepartmentsBySuborganizationId : new loaderGetDepartmentsBySuborganizationId(),
		loaderfacultyGetUndergraduatedegreeFrom : new loaderfacultyGetUndergraduatedegreeFrom(),
		loaderfacultyGetmasterdegreeFrom: new  loaderfacultyGetmasterdegreeFrom(),
		loaderfacultyGetWorksfor: new loaderfacultyGetWorksfor(),
		loaderGetDepartmentsById: new loaderGetDepartmentsById(),
		loaderGraduateStudentSuperviosrById: new loaderGraduateStudentSuperviosrById(),
		loaderUndergraduateStudentSuperviosrById: new loaderUndergraduateStudentSuperviosrById(),
		loaderUndergraduateStudentMemberofById: new loaderUndergraduateStudentMemberofById(),
		loaderUndergraduateTakeCourses: new loaderUndergraduateTakeCourses(),
		loaderGraduateStudentMemberofById: new loaderGraduateStudentMemberofById(),
		loaderGraduateStudentAdvisorById: new loaderGraduateStudentAdvisorById(),
		loaderGraduateTakeCourses: new loaderGraduateTakeCourses(),
		loaderGraduateAssistCourses: new loaderGraduateAssistCourses(),
		loaderGetUndergraduateStudentDepartmentsById: new loaderGetUndergraduateStudentDepartmentsById(),
		loaderGetGraduateStudentDepartmentsById: new loaderGetGraduateStudentDepartmentsById(),
		loaderGetLecturerByDepartmentId: new loaderGetLecturerByDepartmentId(),
		loaderGetProfessorByDepartmentId: new loaderGetProfessorByDepartmentId(),
		loaderGetFacultiesByDepartmentId: new loaderGetFacultiesByDepartmentId(),
		loaderGetAllPublications: new loaderGetAllPublications(),
		loaderGetAllGraduateStudents: new loaderGetAllGraduateStudents(),
		loadergetGraduateStudentByUniIdPlusAdvisor: new loadergetGraduateStudentByUniIdPlusAdvisor(),
		loaderGetUniversityById: new loaderGetUniversityById(),
		loaderGetHeadOfDepartment: new loaderGetHeadOfDepartment(),
		loaderGetFacultyById: new loaderGetFacultyById(),
		loaderUndergraduateStudentById: new loaderUndergraduateStudentById(),
		loaderGetGraduateStudentById: new loaderGetGraduateStudentById(),
		loaderGetGraduateStudentByUniversityId: new loaderGetGraduateStudentByUniversityId(),
		loaderUndergetGraduateStudentByUniversityId: new loaderUndergetGraduateStudentByUniversityId(),
		loaderGetLecturerById: new loaderGetLecturerById(),
		loaderGetProfessorById: new loaderGetProfessorById(),
		loaderGetGraduateStudentPublication: new loaderGetGraduateStudentPublication()
	}
});

server.listen().then(({ url }) => {
	console.log(`🚀 Server ready at ${url}`);
});



