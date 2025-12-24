const { Sequelize } = require("sequelize");
const initModels = require("../models/init-models");
class DbClient {
  constructor() {
    this.sequelize = new Sequelize(
      process.env.DATABASE_NAME || "postgres",
      process.env.DATABASE_USER || "postgres",
      process.env.DATABASE_PASS || "",
      {
        host: process.env.DATABASE_HOST || "localhost",
        dialect: "postgres",
        port: process.env.DATABASE_PORT || 5432,
        logging: false,
      }
    );
    // Models object
    this.models = initModels(this.sequelize);
  }

  async isAlive() {
    try {
      await this.sequelize.authenticate();
      console.debug("Connection has been established successfully.");
      return true;
    } catch (err) {
      console.debug("Unable to connect to the database:", err);
      return false;
    }
  }
}
dbClient = new DbClient();
module.exports = dbClient;
