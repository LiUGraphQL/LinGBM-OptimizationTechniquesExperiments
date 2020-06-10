class RG {
	constructor(args) {
		// Fields

		args = JSON.parse(JSON.stringify(args))
		this.id = args.nr;
		this.subOrganizationOf = args.suborganizationof;
	}


}


module.exports = RG;