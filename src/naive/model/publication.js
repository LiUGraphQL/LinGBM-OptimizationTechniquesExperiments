class Publication {
	constructor(args) {
	  // Fields
		args = JSON.parse(JSON.stringify(args))
		this.id = args.nr;
		this.title = args.title;
		this.abstract = args.abstract;
		this.mainauthor = args.mainauthor;
		
	}


}


module.exports = Publication;