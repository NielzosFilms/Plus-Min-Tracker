"use strict";
const { Model } = require("sequelize");
const passwordHash = require("password-hash");

module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here

			User.hasMany(models.Entry, {
				foreignKey: "userId",
				as: "entries",
			});
		}
	}
	User.init(
		{
			username: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			sequelize,
			paranoid: true,
			modelName: "User",
		}
	);
	return User;
};
