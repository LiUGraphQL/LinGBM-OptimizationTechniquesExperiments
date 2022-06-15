class GraduateTakeCourses {
	constructor(args) {
		// Fields

		args = JSON.parse(JSON.stringify(args))
		this.id = args.graduatecourseid;
		this.graduatestudentid = args.graduatestudentid;
				
		//Relation 
		this.teacher  = args.teacher
		this.teachingassistant = args.teachingassistant
	}


}


module.exports = GraduateTakeCourses;