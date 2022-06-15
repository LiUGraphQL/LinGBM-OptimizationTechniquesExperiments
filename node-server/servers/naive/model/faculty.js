class Faculty {
	constructor(args) {
	  // Fields
	
		args = JSON.parse(JSON.stringify(args))
		this.id = args.nr;
		this.telephone = args.telephone;
		this.emailAddress = args.emailaddress;
		this.undergraduateDegreeFrom = args.undergraduatedegreefrom;
		this.masterDegreeFrom = args.masterdegreefrom;
		this.doctoralDegreeFrom = args.doctoraldegreefrom
		this.worksFor = args.worksfor;
		this.position = args.nr;
		this.researchInterest = args.nr;
		// this.teacherOfGraduateCourses = args.teacherOfGraduateCourses;
		// this.teacherOfUndergraduateCourses = args.teacherOfUndergraduateCourses;
		// this.publications = args.publications;

	}


}


module.exports = Faculty;