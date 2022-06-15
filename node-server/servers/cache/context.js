const {department} = require('./repository/department');
const {faculty} = require('./repository/faculty');
const {graduateCourse} = require('./repository/graduatecourse');
const {graduateStudent} = require('./repository/graduatestudent');
const {lecturer} = require('./repository/lecturer');
const {professor} = require('./repository/professor');
const {publication} = require('./repository/publication');
const {researchGroup} = require('./repository/researchgroup');
const {undergratudateCourse} = require('./repository/undergraduatecourse');
const {undergraduateStudent} = require('./repository/undergraduatestudent');
const {university} = require('./repository/university');

const repository = () =>{
	return{
		repository:{
			department: new department(),
			faculty: new faculty(),
			graduateCourse: new graduateCourse(),
			graduateStudent: new graduateStudent(),
			lecturer: new lecturer(),
			professor: new professor(),
			publication: new publication(),
			researchGroup: new researchGroup(),
			undergratudateCourse: new undergratudateCourse(),
			undergraduateStudent: new undergraduateStudent(),
			university: new university(),
		}
	}
}

module.exports = repository;