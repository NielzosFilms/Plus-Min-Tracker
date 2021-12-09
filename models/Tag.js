"use strict";
const { Model } = require("sequelize");
const passwordHash = require("password-hash");

module.exports = (sequelize, DataTypes) => {
	class Tag extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			Tag.belongsToMany(models.Entry, {
				through: "EntryPlusTags",
				foreignKey: "tagId",
				otherKey: "entryId",
				as: "plusEntries",
			});
			Tag.belongsToMany(models.Entry, {
				through: "EntryMinusTags",
				foreignKey: "tagId",
				otherKey: "entryId",
				as: "minusEntries",
			});
		}
	}
	Tag.init(
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
		},
		{
			sequelize,
			paranoid: true,
			modelName: "Tag",
		}
	);
	return Tag;
};
