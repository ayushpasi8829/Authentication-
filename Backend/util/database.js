const { Sequelize } = require("sequelize");
console.log(process.env.DB_DIALECT);
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: false,
  }
);

module.exports = sequelize;

// const Sequelize = require("sequelize");
// console.log(process.env.dialect);
// const port = 5432;
// const sequelize = new Sequelize("user_management", "postgres", "1234", {
//   host: "localhost",
//   port: port,
//   dialect: "postgres",
//   logging: false,
// });

// module.exports = sequelize;
