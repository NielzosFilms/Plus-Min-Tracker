"use strict";
const faker = require("faker");

module.exports = {
	up: async (queryInterface, Sequelize) => {
		/**
		 * Add seed commands here.
		 *
		 * Example:
		 * await queryInterface.bulkInsert('People', [{
		 *   name: 'John Doe',
		 *   isBetaMember: false
		 * }], {});
		 */

		//get user ids
		const users = await queryInterface.sequelize.query(
			"SELECT id FROM Users WHERE username = 'admin'",
			{
				type: queryInterface.sequelize.QueryTypes.SELECT,
			}
		);

		const entries = [];
		for (let i = 0; i < 100; i++) {
			entries.push({
				comment: faker.lorem.sentence(),
				userId: users[0].id,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		}
		await queryInterface.bulkInsert("Entries", entries, {});

		// get the tag ids
		const tagIds = await queryInterface.sequelize.query(
			"SELECT id FROM Tags",
			{
				type: queryInterface.sequelize.QueryTypes.SELECT,
			}
		);

		// get the entry ids
		const entryIds = await queryInterface.sequelize.query(
			"SELECT id FROM Entries",
			{
				type: queryInterface.sequelize.QueryTypes.SELECT,
			}
		);

		// create the taggings
		const taggings = [];
		for (let i = 0; i < 100; i++) {
			const tagId = tagIds[Math.floor(Math.random() * tagIds.length)];
			const entryId =
				entryIds[Math.floor(Math.random() * entryIds.length)];
			taggings.push({
				tagId: tagId.id,
				entryId: entryId.id,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		}
		await queryInterface.bulkInsert("EntryTags", taggings, {});
	},

	down: async (queryInterface, Sequelize) => {
		/**
		 * Add commands to revert seed here.
		 *
		 * Example:
		 * await queryInterface.bulkDelete('People', null, {});
		 */
		await queryInterface.bulkDelete("EntryTags", null, {});
		await queryInterface.bulkDelete("Entries", null, {});
	},
};
