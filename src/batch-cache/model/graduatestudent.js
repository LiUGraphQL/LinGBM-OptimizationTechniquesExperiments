class GraduateStudent {
	constructor(args) {
		// Fields
	

		args = JSON.parse(JSON.stringify(args))
		this.id = args.nr;
		this.age = args.age;
		this.telephone = args.telephone;
		this.emailAddress = args.emailaddress
		this.memberOf = args.memberof;
		this.undergraduatedegreefrom = args.undergraduatedegreefrom;
		this.advisor = args.advisor;

		// student advisor ResearchInterest Aera
		this.researchInterest =  args.researchinterest
		this.profnr = args.nr
	}


}


module.exports = GraduateStudent