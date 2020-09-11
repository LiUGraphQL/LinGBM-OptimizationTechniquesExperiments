const { memoizeGetGraduateStudentPlusAdvisor,
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
	memoizeGetFacultyProfessor} = require("./repository");

const repository = () =>{
	return{
		repository:{
			memoizeGetGraduateStudent: new memoizeGetGraduateStudent(),
			memoizeGetPublication: new memoizeGetPublication(),
			memoizeGetAllGraduateStudent: new memoizeGetAllGraduateStudent(),
		    memoizeGetUniversityById: new memoizeGetUniversityById(),
		    memoizeGetDoctoralDegreeById: new memoizeGetDoctoralDegreeById(),
		    memoizeGetDoctoralDegreeByWorkFor: new memoizeGetDoctoralDegreeByWorkFor(),
		    memoizeGetPublicationByAuthor: new memoizeGetPublicationByAuthor(),
		    memoizeGetGraduateStudentTakeCourses: new memoizeGetGraduateStudentTakeCourses(),
		    memoizeGetUnderGraduateStudent: new memoizeGetUnderGraduateStudent(),
		    memoizeGetResearchGroupById: new memoizeGetResearchGroupById(),
		    memoizeGetDepartmentHeadById: new memoizeGetDepartmentHeadById(),
		    memoizeGetLecturerById: new memoizeGetLecturerById(),
		    memoizegGetGraduateStudentAdvisorById: new memoizegGetGraduateStudentAdvisorById(),
		    memoizeGetDepartmentById: new memoizeGetDepartmentById(),
		    memoizeGetDepartmentByFacultyId: new memoizeGetDepartmentByFacultyId(),
		    memoizeGetGraduateStudentMemberOf: new memoizeGetGraduateStudentMemberOf(),
		    memoizeGetFacultyLecturer: new memoizeGetFacultyLecturer(),
		    memoizeGetFacultyProfessor: new memoizeGetFacultyProfessor()
		}
	}
}

module.exports = repository;
