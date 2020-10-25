const Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  const Sala = sequelize.define("Sala", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    naziv: Sequelize.STRING
  });
  return Sala;
};
