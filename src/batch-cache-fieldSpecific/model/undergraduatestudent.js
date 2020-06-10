class UnderGraduateStudent {
	constructor(args) {
		// Fields

		args = JSON.parse(JSON.stringify(args))
		this.id = args.nr;
		this.age = args.age;
		this.emailAddress = args.emailaddress
		this.memberOf = args.memberof;
		this.advisor = args.advisor;
		
	}


}


module.exports = UnderGraduateStudent