class Author {
	constructor(args) {
	  // Fields

		args = JSON.parse(JSON.stringify(args))
		this.id = args.nr;
		this.doctoraldegreefrom = args.doctoraldegreefrom;
		this.emailAddress = args.emailaddress;
		this.headof = args.headof;
		this.masterdegreefrom = args.masterdegreefrom;

		this.professortype = args.professortype;
		this.researchInterest = args.researchinterest;
		this.telephone = args.telephone;
		this.undergraduatedegreefrom = args.undergraduatedegreefrom;
		this.worksfor = args.worksfor;



		
	}


}


module.exports = Author;