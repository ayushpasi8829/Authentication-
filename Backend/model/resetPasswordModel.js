const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const ResetPassword = sequelize.define("resetpassword", {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: "users",
      key: "id",
    },
  },
  expiresAt: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = ResetPassword;
