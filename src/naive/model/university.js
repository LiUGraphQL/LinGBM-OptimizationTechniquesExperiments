class Uni {
	constructor(args) {
			// Fields
			
		args = JSON.parse(JSON.stringify(args))
		this.id = args.nr;
		
	}


}


module.exports = Uni;