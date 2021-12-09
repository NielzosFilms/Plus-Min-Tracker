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

		const tags = [];
		for (let i = 0; i < 5; i++) {
			tags.push({
				name: faker.lorem.word(),
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		}
		return queryInterface.bulkInsert("Tags", tags, {});
	},

	down: async (queryInterface, Sequelize) => {
		/**
		 * Add commands to revert seed here.
		 *
		 * Example:
		 * await queryInterface.bulkDelete('People', null, {});
		 */
		return queryInterface.bulkDelete("Tags", null, {});
	},
};
