class UndergraduateTakeCourses {
	constructor(args) {
				// Fields

		args = JSON.parse(JSON.stringify(args))
		this.id = args.undergraduatecourseid;
		this.undergraduatestudentid = args.undergraduatestudentid;
				
		//Relation 
		this.teacher  = args.teacher
		this.teachingassistant = args.teachingassistant
	}


}


module.exports = UndergraduateTakeCourses;