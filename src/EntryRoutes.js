const router = require("express").Router();
const { Op } = require("sequelize");

const models = require("../models");

const getDateInputFormat = (date) => {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	return `${year}-${month}-${day < 10 ? `0${day}` : day}`;
};

router.get("/entries", async (req, res) => {
	if (!req.session.user) {
		res.redirect("/login");
		return;
	}
	console.log(req.query);
	const entries = await models.Entry.findAll({
		where: {
			userId: req.session.user.id,
			...(req?.query?.date ? { date: new Date(req.query.date) } : {}),
			...(req?.query?.search
				? { comment: { [Op.like]: `%${req.query.search}%` } }
				: {}),
		},
		include: [
			{
				model: models.Tag,
				as: "plusTags",
			},
			{
				model: models.Tag,
				as: "minusTags",
			},
		],
		order: [["date", "DESC"]],
	});
	res.render("entries", {
		entries,
		user: req.session.user,
		menu: "entries",
		prevDateFilter: req?.query?.date || "",
		prevSearchFilter: req?.query?.search || "",
	});
});

router.get("/entries/create", async (req, res) => {
	if (!req.session.user) {
		res.redirect("/login");
		return;
	}
	const tags = await models.Tag.findAll();
	res.render("entry-create", {
		validationErrors: [],
		user: req.session.user,
		menu: "entries",
		today: getDateInputFormat(new Date()),
		tags,
	});
});

router.post("/entries/create", async (req, res) => {
	if (!req.session.user) {
		res.redirect("/login");
		return;
	}
	if (req.body.comment.length < 1) {
		const tags = await models.Tag.findAll();
		res.render("entry-create", {
			validationErrors: ["Comment is required"],
			user: req.session.user,
			menu: "entries",
			today: getDateInputFormat(new Date()),
			tags,
		});
		return;
	}
	const entry = await models.Entry.create({
		date: req.body.date,
		userId: req.session.user.id,
		comment: req.body.comment,
	});
	if (req.body.plusTags) {
		if (Array.isArray(req.body.plusTags)) {
			await entry.setPlusTags(req.body.plusTags);
		} else {
			await entry.setPlusTags([req.body.plusTags]);
		}
	} else {
		await entry.setPlusTags([]);
	}
	if (req.body.minusTags) {
		if (Array.isArray(req.body.minusTags)) {
			await entry.setMinusTags(req.body.minusTags);
		} else {
			await entry.setMinusTags([req.body.minusTags]);
		}
	} else {
		await entry.setMinusTags([]);
	}
	await entry.save();
	res.redirect(`/entries/${entry.id}`);
});

router.get("/entries/:id", async (req, res) => {
	if (!req.session.user) {
		res.redirect("/login");
		return;
	}
	const entry = await models.Entry.findOne({
		where: {
			id: req.params.id,
		},
		include: [
			{
				model: models.Tag,
				as: "plusTags",
			},
			{
				model: models.Tag,
				as: "minusTags",
			},
		],
	});
	const tags = await models.Tag.findAll();
	res.render("entry", {
		entry,
		user: req.session.user,
		menu: "entries",
		validationErrors: [],
		today: getDateInputFormat(new Date()),
		dateVal: getDateInputFormat(new Date(entry.date)),
		tags,
	});
});

router.post("/entries/:id", async (req, res) => {
	if (!req.session.user) {
		res.redirect("/login");
		return;
	}
	if (req.body.comment.length < 1) {
		const tags = await models.Tag.findAll();
		res.render("entry", {
			validationErrors: ["Comment is required"],
			user: req.session.user,
			menu: "entries",
			today: getDateInputFormat(new Date()),
			dateVal: getDateInputFormat(new Date(entry.date)),
			tags,
		});
		return;
	}
	const entry = await models.Entry.findOne({
		where: {
			id: req.params.id,
		},
	});
	entry.date = req.body.date;
	entry.comment = req.body.comment;
	if (req.body.plusTags) {
		if (Array.isArray(req.body.plusTags)) {
			await entry.setPlusTags(req.body.plusTags);
		} else {
			await entry.setPlusTags([req.body.plusTags]);
		}
	} else {
		await entry.setPlusTags([]);
	}
	if (req.body.minusTags) {
		if (Array.isArray(req.body.minusTags)) {
			await entry.setMinusTags(req.body.minusTags);
		} else {
			await entry.setMinusTags([req.body.minusTags]);
		}
	} else {
		await entry.setMinusTags([]);
	}
	await entry.save();
	res.redirect(`/entries/${entry.id}`);
});

router.get("/entries/:id/delete", async (req, res) => {
	if (!req.session.user) {
		res.redirect("/login");
		return;
	}
	const entry = await models.Entry.findOne({
		where: {
			id: req.params.id,
		},
	});
	await entry.destroy();
	res.redirect("/entries");
});

module.exports = router;
