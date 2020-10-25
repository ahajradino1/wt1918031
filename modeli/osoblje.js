const Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  const Osoblje = sequelize.define("Osoblje", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ime: Sequelize.STRING,
    prezime: Sequelize.STRING,
    uloga: Sequelize.STRING
  });
  return Osoblje;
};
