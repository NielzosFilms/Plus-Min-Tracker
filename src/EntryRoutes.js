const router = require("express").Router();

const models = require("../models");

router.get("/entries", async (req, res) => {
	if (!req.session.user) {
		res.redirect("/login");
		return;
	}
	const entries = await models.Entry.findAll({
		where: {
			userId: req.session.user.id,
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
		order: [["createdAt", "DESC"]],
	});
	res.render("entries", { entries, user: req.session.user, menu: "entries" });
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
			tags,
		});
		return;
	}
	const entry = await models.Entry.create({
		userId: req.session.user.id,
		comment: req.body.comment,
	});
	if (req.body.plusTags) {
		if (Array.isArray(req.body.plusTags)) {
			await entry.setPlusTags(req.body.plusTags);
		} else {
			await entry.setPlusTags([req.body.plusTags]);
		}
	}
	if (req.body.minusTags) {
		if (Array.isArray(req.body.minusTags)) {
			await entry.setMinusTags(req.body.minusTags);
		} else {
			await entry.setMinusTags([req.body.minusTags]);
		}
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
			tags,
		});
		return;
	}
	const entry = await models.Entry.findOne({
		where: {
			id: req.params.id,
		},
	});
	entry.comment = req.body.comment;
	if (req.body.plusTags) {
		if (Array.isArray(req.body.plusTags)) {
			await entry.setPlusTags(req.body.plusTags);
		} else {
			await entry.setPlusTags([req.body.plusTags]);
		}
	}
	if (req.body.minusTags) {
		if (Array.isArray(req.body.minusTags)) {
			await entry.setMinusTags(req.body.minusTags);
		} else {
			await entry.setMinusTags([req.body.minusTags]);
		}
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
