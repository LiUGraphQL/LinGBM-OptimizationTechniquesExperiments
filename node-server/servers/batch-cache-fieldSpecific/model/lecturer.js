class Lec {
	constructor(args) {
	  // Fields
		
		//args = JSON.parse(JSON.stringify(args))
		this.id = args.nr
		this.telephone = args.telephone;
		this.emailAddress = args.emailaddress;
		this.undergraduateDegreeFrom = args.undergraduatedegreefrom;
		this.masterDegreeFrom = args.masterdegreefrom;
		this.doctoralDegreeFrom = args.doctoraldegreefrom;
		this.worksFor = args.worksfor;
		this.position = "Lecturer"
	  
	}


}


module.exports = Lec