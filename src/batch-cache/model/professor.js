class Professor {
	constructor(args) {
		// Fields

		this.id = args? args.nr : null;
		this.profType = args?  args.professortype:null;
		this.researchInterest = args? args.researchinterest:null;
		this.headof = args? args.headof: null;
		this.emailAddress = args? args.emailaddress: null
		this.telephone = args? args.telephone : null
		this.worksFor = args? args.worksfor: null
		this.undergraduteDegreeFrom = args? args.undergraduatedegreefrom :null
		this.masterDegreeFrom = args?args.masterdegreefrom:null
		this.doctoralDegreeFrom = args?args.doctoraldegreefrom:null
	}


}


module.exports = Professor;