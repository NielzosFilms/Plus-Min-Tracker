const router = require("express").Router();

const models = require("../models");

// crud routes for tags
router.get("/tags", async (req, res) => {
	if (!req.session.user) {
		res.redirect("/login");
		return;
	}
	const tags = await models.Tag.findAll({
		order: [["name", "ASC"]],
	});
	res.render("tags/index", { tags, user: req.session.user, menu: "tags" });
});

router.get("/tags/new", (req, res) => {
	if (!req.session.user) {
		res.redirect("/login");
		return;
	}
	res.render("tags/new", { user: req.session.user, menu: "tags" });
});

router.post("/tags/new", async (req, res) => {
	if (!req.session.user) {
		res.redirect("/login");
		return;
	}
	await models.Tag.create({
		name: req.body.name,
	});
	res.redirect("/tags");
});

router.get("/tags/:id/delete", async (req, res) => {
	if (!req.session.user) {
		res.redirect("/login");
		return;
	}
	const tag = await models.Tag.findByPk(req.params.id);
	await tag.destroy();
	res.redirect("/tags");
});

router.get("/tags/:id", async (req, res) => {
	if (!req.session.user) {
		res.redirect("/login");
		return;
	}
	const tag = await models.Tag.findOne({
		where: {
			id: req.params.id,
		},
	});
	res.render("tags/show", { tag, user: req.session.user, menu: "tags" });
});

router.post("/tags/:id", async (req, res) => {
	if (!req.session.user) {
		res.redirect("/login");
		return;
	}
	const tag = await models.Tag.findOne({
		where: {
			id: req.params.id,
		},
	});
	tag.name = req.body.name;
	await tag.save();
	res.redirect("/tags");
});

module.exports = router;
