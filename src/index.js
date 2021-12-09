const express = require("express");
const session = require("express-session");
const { v4: uuidv4 } = require("uuid");

const models = require("../models");

const userRoutes = require("./UserRoutes");
const entryRoutes = require("./EntryRoutes");
const tagRoutes = require("./TagRoutes");
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
		});

		const reduceTags = (acc, curr) => {
			let currDay = new Date(curr.createdAt).getDay();
			if (currDay === 0) currDay = 7;
			return {
				...acc,
				[currDay]: [...(acc[currDay] || []), curr],
			};
		};

		const plusTags = await models.sequelize.query(
			`SELECT * FROM EntryPlusTags`,
			{ type: QueryTypes.SELECT }
		);

		const reducedPlusTags = plusTags.reduce(reduceTags, {});

		const minusTags = await models.sequelize.query(
			`SELECT * FROM EntryMinusTags`,
			{ type: QueryTypes.SELECT }
		);

		const reducedMinusTags = minusTags.reduce(reduceTags, {});

		const getCountPerDay = (reduced) => {
			for (let i = 1; i <= 7; i++) {
				if (!reduced[i]) {
					reduced[i] = [];
				}
			}
			return reduced;
		};

		const dashboardData = {
			type: "bar",
			data: {
				labels: [
					"Monday",
					"Tuesday",
					"Wednesday",
					"Thursday",
					"Friday",
					"Saturday",
					"Sunday",
				],
				datasets: [
					{
						label: "Plus",
						data: Object.keys(getCountPerDay(reducedPlusTags))
							.sort()
							.map((day) => reducedPlusTags[day].length),
						backgroundColor: "rgba(75, 192, 192, 0.2)",
						borderColor: "rgba(75, 192, 192, 1)",
						borderWidth: 1,
					},
					{
						label: "Minus",
						data: Object.keys(getCountPerDay(reducedMinusTags))
							.sort()
							.map((day) => reducedMinusTags[day].length),
						backgroundColor: "rgba(255, 99, 132, 0.2)",
						borderColor: "rgba(255, 99, 132, 1)",
						borderWidth: 1,
					},
				],
			},
			options: {
				scales: {
					y: {
						beginAtZero: true,
					},
				},
			},
		};
		res.render("dashboard", {
			user: req.session.user,
			entries,
			dashboardData,
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
