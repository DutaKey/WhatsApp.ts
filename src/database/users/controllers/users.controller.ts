import db from "../models";

const User = db.users;

const all = async () => {
	return await User.find()
		.then((result) => {
			return result;
		})
		.catch((err) => {
			return err;
		});
};

const findAndCreate = async (number: number) => {
	let data = await find(number);
	if (!data) {
		const user = new User({
			_id: number,
			messageHistory: [],
		});
		return await user
			.save(user)
			.then((result) => {
				return result;
			})
			.catch((err) => {
				return err;
			});
	}
	return;
};

const find = async (id: number) => {
	return await User.findById(id)
		.then((result) => {
			return result;
		})
		.catch((err) => {
			return err;
		});
};

const addMessage = async (id: number, message: string) => {
	let userData = await User.findById(id);
	if (!userData) {
		return {
			error: "User not found",
		};
	}
	let Message = userData.messageHistory;
	Message.push(message);
	return await User.findByIdAndUpdate(id, { messageHistory: Message })
		.then((result) => {
			return result;
		})
		.catch((err) => {
			return err;
		});
};

const deleteByNumber = async (id: number) => {
	return await User.findByIdAndRemove(id)
		.then((result) => {
			return result;
		})
		.catch((err) => {
			return err;
		});
};

export default {
	all,
	findAndCreate,
	find,
	addMessage,
	deleteByNumber,
};
