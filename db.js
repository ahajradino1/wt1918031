const Sequelize = require("sequelize");
const sequelize = new Sequelize("DBWT19", "root", "root", {
  host: "127.0.0.1",
  dialect: "mysql",
  logging: false
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.osoblje = sequelize.import(__dirname + "/modeli/osoblje.js");
db.rezervacija = sequelize.import(__dirname + "/modeli/rezervacija.js");
db.termin = sequelize.import(__dirname + "/modeli/termin.js");
db.sala = sequelize.import(__dirname + "/modeli/sala.js");

//1-to-many
db.osoblje.hasMany(db.rezervacija, { as: "predavac", foreignKey: "osoba" });
db.rezervacija.belongsTo(db.osoblje, { as: "predavac", foreignKey: "osoba" });

//1-to-1
db.termin.hasOne(db.rezervacija, {
  as: "terminRezervacije",
  foreignKey: {
    name: "termin",
    type: Sequelize.INTEGER,
    unique: true
  }
});
db.rezervacija.belongsTo(db.termin, {
  as: "terminRezervacije",
  foreignKey: {
    name: "termin",
    type: Sequelize.INTEGER,
    unique: true
  }
});

//1-to-many
db.sala.hasMany(db.rezervacija, { as: "rezervisanaSala", foreignKey: "sala" });
db.rezervacija.belongsTo(db.sala, {
  as: "rezervisanaSala",
  foreignKey: "sala"
});

//1-to-1
db.osoblje.hasOne(db.sala, {
  as: "zaduzenoOsoblje",
  foreignKey: "zaduzenaOsoba"
});
db.sala.belongsTo(db.osoblje, {
  as: "zaduzenoOsoblje",
  foreignKey: "zaduzenaOsoba"
});

module.exports = db;
