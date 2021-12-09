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
		order: [["createdAt", "DESC"]],
	});
	res.render("entries", { entries, user: req.session.user, menu: "entries" });
});

router.get("/entries/create", async (req, res) => {
	if (!req.session.user) {
		res.redirect("/login");
		return;
	}
	res.render("entry-create", {
		validationErrors: [],
		user: req.session.user,
		menu: "entries",
	});
});

router.post("/entries/create", async (req, res) => {
	if (!req.session.user) {
		res.redirect("/login");
		return;
	}
	if (req.body.comment.length < 1) {
		res.render("entry-create", {
			validationErrors: ["Comment is required"],
			user: req.session.user,
			menu: "entries",
		});
		return;
	}
	const entry = await models.Entry.create({
		userId: req.session.user.id,
		comment: req.body.comment,
	});
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
	});
	res.render("entry", {
		entry,
		user: req.session.user,
		menu: "entries",
		validationErrors: [],
	});
});

router.post("/entries/:id", async (req, res) => {
	if (!req.session.user) {
		res.redirect("/login");
		return;
	}
	if (req.body.comment.length < 1) {
		res.render("entry", {
			validationErrors: ["Comment is required"],
			user: req.session.user,
			menu: "entries",
		});
		return;
	}
	const entry = await models.Entry.findOne({
		where: {
			id: req.params.id,
		},
	});
	entry.comment = req.body.comment;
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
