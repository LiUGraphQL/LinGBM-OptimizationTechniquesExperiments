const {department} = require('./loaders/department');
const {faculty} = require('./loaders/faculty');
const {graduateCourse} = require('./loaders/graduatecourse');
const {graduateStudent} = require('./loaders/graduatestudent');
const {lecturer} = require('./loaders/lecturer');
const {professor} = require('./loaders/professor');
const {publication} = require('./loaders/publication');
const {researchGroup} = require('./loaders/researchgroup');
const {undergratudateCourse} = require('./loaders/undergraduatecourse');
const {undergraduateStudent} = require('./loaders/undergraduatestudent');
const {university} = require('./loaders/university');

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