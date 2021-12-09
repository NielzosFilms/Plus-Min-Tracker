const models = require("../models");

const weekdays = {
	1: 0,
	2: 0,
	3: 0,
	4: 0,
	5: 0,
	6: 0,
	7: 0,
};

const getDashboardDataWeekdays = async (user) => {
	const entries = await models.Entry.findAll({
		where: {
			userId: user.id,
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
				...weekdays,
			},
			minus: {
				...weekdays,
			},
		}
	);

	return {
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
};

const getDashboardDataTags = async (user) => {
	const tags = await models.Tag.findAll({
		include: [
			{
				model: models.Entry,
				as: "plusEntries",
				where: {
					userId: user.id,
				},
				required: false,
			},
			{
				model: models.Entry,
				as: "minusEntries",
				where: {
					userId: user.id,
				},
				required: false,
			},
		],
	});

	return {
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
};

const getDashboardDataTagRatio = async (user) => {
	const tags = await models.Tag.findAll({
		include: [
			{
				model: models.Entry,
				as: "plusEntries",
				where: {
					userId: user.id,
				},
				required: false,
			},
			{
				model: models.Entry,
				as: "minusEntries",
				where: {
					userId: user.id,
				},
				required: false,
			},
		],
	});

	const reducedTags = tags.reduce(
		(acc, curr) => ({
			plus: acc.plus + curr.plusEntries.length,
			minus: acc.minus + curr.minusEntries.length,
		}),
		{
			plus: 0,
			minus: 0,
		}
	);

	return {
		type: "pie",
		data: {
			labels: ["Plus", "Minus"],
			datasets: [
				{
					label: ["Plus"],
					data: [reducedTags.plus, reducedTags.minus],
					backgroundColor: [
						"rgba(75, 192, 192, 0.2)",
						"rgba(255, 99, 132, 0.2)",
					],
					borderColor: [
						"rgba(75, 192, 192, 1)",
						"rgba(255, 99, 132, 1)",
					],
					borderWidth: 1,
				},
			],
		},
		options: {
			plugins: {
				legend: {
					position: "top",
				},
				title: {
					display: true,
					text: "+ - ratio",
				},
			},
		},
	};
};

const getDashboardDataFrequency = async (user) => {
	const entries = await models.Entry.findAll({
		where: {
			userId: user.id,
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
};

module.exports = {
	getDashboardDataWeekdays,
	getDashboardDataTags,
	getDashboardDataTagRatio,
};
