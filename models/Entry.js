"use strict";
const { Model } = require("sequelize");
const passwordHash = require("password-hash");

module.exports = (sequelize, DataTypes) => {
	class Entry extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			Entry.belongsTo(models.User, {
				foreignKey: "userId",
				as: "user",
			});

			Entry.belongsToMany(models.Tag, {
				through: "EntryTags",
				foreignKey: "entryId",
				otherKey: "tagId",
				as: "plusTags",
			});
			Entry.belongsToMany(models.Tag, {
				through: "EntryTags",
				foreignKey: "entryId",
				otherKey: "tagId",
				as: "minusTags",
			});
		}
	}
	Entry.init(
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			comment: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			sequelize,
			paranoid: true,
			modelName: "Entry",
		}
	);
	return Entry;
};
