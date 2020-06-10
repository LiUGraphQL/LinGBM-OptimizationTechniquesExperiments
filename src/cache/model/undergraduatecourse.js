class UndergraduateCourses {
	constructor(args) {
	  // Fields
		args = JSON.parse(JSON.stringify(args))
		this.id = args.nr;
		this.teacher = args.teacher;
		this.teachingassistants = args.teachingassistant;
	

	}


}


module.exports = UndergraduateCourses;