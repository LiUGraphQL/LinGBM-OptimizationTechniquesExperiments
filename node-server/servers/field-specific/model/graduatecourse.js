class GradudateCourse {
	constructor(args) {
		// Fields
		args = JSON.parse(JSON.stringify(args))
		this.id = args.nr
		this.teacher = args.teacher

	}

}


module.exports = GradudateCourse