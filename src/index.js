const express = require("express");
const session = require("express-session");
const { v4: uuidv4 } = require("uuid");

const models = require("../models");

const userRoutes = require("./UserRoutes");
const entryRoutes = require("./EntryRoutes");
const tagRoutes = require("./TagRoutes");
const dashboard = require("./dashboard");
const { QueryTypes } = require("sequelize");

const oneDay = 1000 * 60 * 60 * 24;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
	session({
		secret: uuidv4(),
		saveUninitialized: true,
		cookie: { maxAge: oneDay * 7 },
		resave: false,
	})
);

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use("/", userRoutes);
app.use("/", entryRoutes);
app.use("/", tagRoutes);

// Set routes
app.get("/", async (req, res) => {
	if (req.session.user) {
		res.render("dashboard", {
			user: req.session.user,
			dashboardDataWeekdays: await dashboard.getDashboardDataWeekdays(
				req.session.user
			),
			dashboardDataTags: await dashboard.getDashboardDataTags(
				req.session.user
			),
			dashboardDataRatio: await dashboard.getDashboardDataTagRatio(
				req.session.user
			),
			menu: "dashboard",
		});
	} else {
		res.render("index", { menu: "dashboard" });
	}
});

// 404 route
app.use((req, res) => {
	res.status(404).render("404", {
		user: req.session.user,
	});
});

// Start server
app.listen(3000, () => {
	console.log("Server started on port 3000");
});

module.exports = app;
