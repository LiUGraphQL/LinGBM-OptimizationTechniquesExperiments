class Department {
	constructor(args) {
	  // Fields
		args = JSON.parse(JSON.stringify(args))
		this.id = args.nr;
		this.head = args.head;
		this.subOrganizationOf = args.suborganizationof

	}


}


module.exports = Department;