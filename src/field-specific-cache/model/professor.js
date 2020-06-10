class Professor {
	constructor(args) {
		// Fields

		args = JSON.parse(JSON.stringify(args))
		this.id = args.nr;
		this.profType = args.professortype;
		this.researchInterest = args.researchinterest
		this.headof = args.headof
		this.emailAddress = args.emailaddress
		this.telephone = args.telephone
		this.worksFor = args.worksfor
		this.undergraduteDegreeFrom = args.undergraduatedegreefrom
		this.masterDegreeFrom = args.masterdegreefrom
		this.doctoralDegreeFrom = args.doctoraldegreefrom
	}


}


module.exports = Professor;