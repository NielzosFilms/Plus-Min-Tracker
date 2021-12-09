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

		const tags = await models.Tag.findAll({
			include: [
				{
					model: models.Entry,
					as: "plusEntries",
					where: {
						userId: req.session.user.id,
					},
					require: false,
				},
				{
					model: models.Entry,
					as: "minusEntries",
					where: {
						userId: req.session.user.id,
					},
					require: false,
				},
			],
		});

		const reducedTags = entries.reduce(
			(acc, curr) => {
				let currDay = new Date(curr.date).getDay();
				if (currDay === 0) currDay = 7;
				const plusCount = curr.plusTags.length;
				const minusCount = curr.minusTags.length;
				return {
					...acc,
					plus: {
						...acc.plus,
						[currDay]: (acc.plus[currDay] || 0) + plusCount,
					},
					minus: {
						...acc.minus,
						[currDay]: (acc.minus[currDay] || 0) + minusCount,
					},
				};
			},
			{
				plus: {
					1: 0,
					2: 0,
					3: 0,
					4: 0,
					5: 0,
					6: 0,
					7: 0,
				},
				minus: {
					1: 0,
					2: 0,
					3: 0,
					4: 0,
					5: 0,
					6: 0,
					7: 0,
				},
			}
		);

		const dashboardDataWeekdays = {
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
						data: Object.keys(reducedTags.plus).map(
							(key) => reducedTags.plus[key]
						),
						backgroundColor: "rgba(75, 192, 192, 0.2)",
						borderColor: "rgba(75, 192, 192, 1)",
						borderWidth: 1,
					},
					{
						label: "Minus",
						data: Object.keys(reducedTags.minus).map(
							(key) => reducedTags.minus[key]
						),
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
				plugins: {
					legend: {
						position: "top",
					},
					title: {
						display: true,
						text: "+ - per weekday",
					},
				},
			},
		};

		const dashboardDataTags = {
			type: "bar",
			data: {
				labels: tags.map((tag) => tag.name),
				datasets: [
					{
						label: "Plus",
						data: tags.map((tag) => tag.plusEntries.length),
						backgroundColor: "rgba(75, 192, 192, 0.2)",
						borderColor: "rgba(75, 192, 192, 1)",
						borderWidth: 1,
					},
					{
						label: "Minus",
						data: tags.map((tag) => tag.minusEntries.length),
						backgroundColor: "rgba(255, 99, 132, 0.2)",
						borderColor: "rgba(255, 99, 132, 1)",
						borderWidth: 1,
					},
				],
			},
			options: {
				indexAxis: "y",
				scales: {
					y: {
						beginAtZero: true,
					},
				},
				plugins: {
					legend: {
						position: "top",
					},
					title: {
						display: true,
						text: "+ - per tag",
					},
				},
			},
		};
		res.render("dashboard", {
			user: req.session.user,
			entries,
			dashboardDataWeekdays,
			dashboardDataTags,
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
