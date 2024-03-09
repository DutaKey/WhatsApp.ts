export const usersModel = (mongoose: any) => {
	const schema = mongoose.Schema({
		_id: Number,
		messageHistory: {},
	});

	schema.method("toJSON", function (this: any) {
		const { __v, _id, ...object } = this.toObject();
		object.id = _id;
		return object;
	});

	const User = mongoose.model("users", schema);
	return User;
};
