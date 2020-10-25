const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const session = require("express-session");
const app = express();

const db = require("./db.js");
db.sequelize
  .sync({ force: true })
  .then(function() {
    inicijalizacija();
  })
  .then(function() {
    console.log("Gotovo kreiranje tabela i ubacivanje pocetnih podataka!");
  });

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "sifra",
    resave: true,
    saveUninitialized: true
  })
);

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/public/html/pocetna.html");
});

// app.get("/zauzeca", function(req, res) {
//   res.sendFile(__dirname + "/zauzeca.json");
// });

app.post("/rezervacija", function(req, res) {
  var dataJson;
  let cijelaBaza = { redovna: [], vanredna: [] };
  db.rezervacija
    .findAll({
      include: [
        {
          model: db.osoblje,
          as: "predavac"
        },
        {
          model: db.sala,
          as: "rezervisanaSala"
        },
        {
          model: db.termin,
          as: "terminRezervacije"
        }
      ]
    })
    .then(results => {
      for (var i = 0; i < results.length; i++) {
        if (results[i].terminRezervacije != null) {
          if (results[i].terminRezervacije.redovni == true) {
            var dan = results[i].terminRezervacije.dan;
            var semestar = results[i].terminRezervacije.semestar;
            var pocetak = results[i].terminRezervacije.pocetak.substr(0, 5);
            var kraj = results[i].terminRezervacije.kraj.substr(0, 5);
            var naziv = results[i].rezervisanaSala.naziv;
            var predavac =
              results[i].predavac.ime +
              " " +
              results[i].predavac.prezime +
              " " +
              results[i].predavac.uloga;
            cijelaBaza.redovna.push({
              dan: dan,
              semestar: semestar,
              pocetak: pocetak,
              kraj: kraj,
              naziv: naziv,
              predavac: predavac
            });
          } else {
            var datum = results[i].terminRezervacije.datum;
            var pocetak = results[i].terminRezervacije.pocetak.substr(0, 5);
            var kraj = results[i].terminRezervacije.kraj.substr(0, 5);
            var naziv = results[i].rezervisanaSala.naziv;
            var predavac =
              results[i].predavac.ime +
              " " +
              results[i].predavac.prezime +
              " " +
              results[i].predavac.uloga;
            cijelaBaza.vanredna.push({
              datum: datum,
              pocetak: pocetak,
              kraj: kraj,
              naziv: naziv,
              predavac: predavac
            });
          }
        }
      }
      dataJson = cijelaBaza;
      let ucitano = req.body;

      var periodicna = false;
      if (req.body.hasOwnProperty("dan")) {
        periodicna = true;
        req.body["dan"] = parseInt(req.body["dan"]);
      }

      if (!validirajZauzece(ucitano, periodicna)) {
        res.json({ error: "Pogrešni podaci!" });
      } else {
        var greska = false;
        if (periodicna) {
          for (var i = 0; i < dataJson.redovna.length; i++) {
            var rezervacija = dataJson.redovna[i];
            var dan = rezervacija["dan"];
            var semestar = rezervacija["semestar"];
            var pocetak = rezervacija["pocetak"];
            var kraj = rezervacija["kraj"];
            var naziv = rezervacija["naziv"];
            var predavac = rezervacija["predavac"];

            if (
              dan == ucitano["dan"] &&
              semestar == ucitano["semestar"] &&
              !(pocetak >= ucitano["kraj"] || kraj <= ucitano["pocetak"]) &&
              naziv == ucitano["naziv"]
            ) {
              greska = true;
              break;
            }
          }
        } else {
          for (var i = 0; i < dataJson.vanredna.length; i++) {
            var rezervacija = dataJson.vanredna[i];
            var datum = rezervacija["datum"];
            var pocetak = rezervacija["pocetak"];
            var kraj = rezervacija["kraj"];
            var naziv = rezervacija["naziv"];
            var predavac = rezervacija["predavac"];

            if (
              datum == ucitano["datum"] &&
              !(pocetak >= ucitano["kraj"] || kraj <= ucitano["pocetak"]) &&
              naziv == ucitano["naziv"]
            ) {
              greska = true;
              break;
            }
          }
        }

        if (greska == false) {
          let promises = [];
          let p = new Promise(function(resolve, reject) {
            var uloga;
            if (ucitano["predavac"].replace(",", "").split(" ").length < 3)
              uloga = null;
            else uloga = ucitano["predavac"].replace(",", "").split(" ")[2];
            var predavac = ucitano["predavac"].replace(",", "").split(" ");

            promises.push(
              db.osoblje.findOrCreate({
                where: {
                  ime: predavac[0],
                  prezime: predavac[1],
                  uloga: uloga
                }
              })
            );
            promises.push(
              db.sala.findOrCreate({ where: { naziv: ucitano["naziv"] } })
            );
            var d;
            var s;
            var dat;
            if (periodicna) {
              d = ucitano["dan"];
              dat = null;
              s = ucitano["semestar"];
            } else {
              d = null;
              dat = ucitano["datum"];
              s = null;
            }
            promises.push(
              db.termin.create({
                redovni: periodicna,
                dan: d,
                datum: dat,
                semestar: s,
                pocetak: ucitano["pocetak"],
                kraj: ucitano["kraj"]
              })
            );
            promises.push(db.rezervacija.create({}));
            Promise.all(promises)
              .then(function(podaci) {
                podaci[3].setPredavac(podaci[0][0]);
                podaci[3].setRezervisanaSala(podaci[1][0]);
                podaci[3].setTerminRezervacije(podaci[2]);
              })
              .catch(function(err) {
                console.log("Greska: " + err);
              });
          });
          if (periodicna) dataJson.redovna.push(req.body);
          else dataJson.vanredna.push(req.body);
          res.json({ zauzeca: dataJson });
        } else {
          var poruka;
          if (periodicna) {
            var dani = [
              "ponedjeljak",
              "utorak",
              "srijeda",
              "četvrtak",
              "petak",
              "subota",
              "nedjelja"
            ];
            poruka =
              "Nije moguće periodično rezervisati salu " +
              ucitano["naziv"] +
              " u " +
              dani[ucitano["dan"]] +
              " (" +
              ucitano["semestar"] +
              " semestar) i termin od " +
              ucitano["pocetak"] +
              " do " +
              ucitano["kraj"] +
              "!";
          } else {
            poruka =
              "Nije moguće rezervisati salu " +
              ucitano["naziv"] +
              " za navedeni datum " +
              ucitano["datum"] +
              " i termin od " +
              ucitano["pocetak"] +
              " do " +
              ucitano["kraj"] +
              "!";
          }
          var a = predavac.replace(",", "").split(" ");
          poruka += " Salu je zauzeo/la " + a[0] + " " + a[1] + ".";
          json = JSON.stringify(dataJson);
          res.json({ error: poruka });
        }
      }
    });
});

app.get("/img", function(req, res) {
  fs.readdir("./img", function(error, files) {
    res.write(JSON.stringify(files));
    var posjecenost = new Object();
    for (var i = 0; i < files.length; i++) {
      posjecenost[files[i]] = 0;
    }
    req.session.slike = posjecenost;
    res.send();
  });
});

app.get("/slika", function(req, res) {
  res.sendFile(__dirname + "/img/" + prvaDostupna(req.session.slike));
});

app.get("/osoblje", function(req, res) {
  db.osoblje.findAll().then(function(result) {
    var osoblje = [];
    for (var i = 0; i < result.length; i++)
      osoblje.push({
        ime: result[i].ime,
        prezime: result[i].prezime,
        uloga: result[i].uloga
      });
    res.send(JSON.stringify(osoblje));
  });
});

app.get("/sale", function(req, res) {
  db.sala.findAll().then(s => {
    var sale = [];
    for (var i = 0; i < s.length; i++) {
      sale.push({ naziv: s[i].naziv });
    }
    res.send(JSON.stringify(sale));
  });
});

app.get("/sveRezervacije", function(req, res) {
  let cijelaBaza = { redovna: [], vanredna: [] };
  db.rezervacija
    .findAll({
      include: [
        {
          model: db.osoblje,
          as: "predavac"
        },
        {
          model: db.sala,
          as: "rezervisanaSala"
        },
        {
          model: db.termin,
          as: "terminRezervacije"
        }
      ]
    })
    .then(function(results) {
      for (var i = 0; i < results.length; i++) {
        if (results[i].terminRezervacije.redovni == true) {
          var dan = results[i].terminRezervacije.dan;
          var semestar = results[i].terminRezervacije.semestar;
          var pocetak = results[i].terminRezervacije.pocetak.substr(0, 5);
          var kraj = results[i].terminRezervacije.kraj.substr(0, 5);
          var naziv = results[i].rezervisanaSala.naziv;
          var predavac =
            results[i].predavac.ime +
            " " +
            results[i].predavac.prezime +
            " " +
            results[i].predavac.uloga;
          cijelaBaza.redovna.push({
            dan: dan,
            semestar: semestar,
            pocetak: pocetak,
            kraj: kraj,
            naziv: naziv,
            predavac: predavac
          });
        } else {
          var datum = results[i].terminRezervacije.datum;
          var pocetak = results[i].terminRezervacije.pocetak.substr(0, 5);
          var kraj = results[i].terminRezervacije.kraj.substr(0, 5);
          var naziv = results[i].rezervisanaSala.naziv;
          var predavac =
            results[i].predavac.ime +
            " " +
            results[i].predavac.prezime +
            " " +
            results[i].predavac.uloga;
          cijelaBaza.vanredna.push({
            datum: datum,
            pocetak: pocetak,
            kraj: kraj,
            naziv: naziv,
            predavac: predavac
          });
        }
      }
      res.send(cijelaBaza);
    });
});

app.listen(8080);
module.exports = {
  app: app,
  init: inicijalizacija
};

function prvaDostupna(slike) {
  for (var key in slike) {
    if (slike[key] == 0) {
      slike[key] = 1;
      return key;
    }
  }
}

function validirajZauzece(zauzece, periodicnost) {
  if (
    !zauzece.hasOwnProperty("pocetak") ||
    !zauzece.hasOwnProperty("kraj") ||
    !zauzece.hasOwnProperty("naziv") ||
    !zauzece.hasOwnProperty("predavac")
  ) {
    console.log("property");
    return false;
  }
  if (periodicnost) {
    if (!zauzece.hasOwnProperty("dan") || !zauzece.hasOwnProperty("semestar")) {
      console.log("dan / semestar");
      return false;
    }
    if (zauzece.length > 5) return false;

    var dan = zauzece["dan"];
    if (dan < 0 || dan > 6) return false;

    var semestar = zauzece["semestar"];
    if (semestar != "zimski" && semestar != "ljetni") {
      console.log("semestar nije z/lj");

      return false;
    }
  } else {
    if (!zauzece.hasOwnProperty("datum")) return false;
    var datum = zauzece["datum"];
    var regex = /^^([0-2][0-9]|(3)[0-1])(\.)(((0)[0-9])|((1)[0-2]))(\.)\d{4}$/g;
    if (!datum.match(regex)) {
      console.log("neispravan datum");
      return false;
    }
  }
  var pocetak = zauzece["pocetak"];
  var regex1 = /^[0-1][0-9]:[0-5][0-9]$/g;
  var regex2 = /^[2][0-3]:[0-5][0-9]$/g;

  if (!pocetak.match(regex1) && !pocetak.match(regex2)) {
    console.log("neispravan pocetak");
    return false;
  }
  var kraj = zauzece["kraj"];
  if (!kraj.match(regex1) && !kraj.match(regex2)) {
    console.log("neispravan kraj");
    return false;
  }
  return true;
}

function inicijalizacija() {
  let promises = [];
  var a = new Promise(function(resolve, reject) {
    promises.push(
      db.osoblje.findOrCreate({
        where: { ime: "Neko", prezime: "Nekić", uloga: "profesor" }
      })
    );
    promises.push(
      db.osoblje.findOrCreate({
        where: { ime: "Drugi", prezime: "Neko", uloga: "asistent" }
      })
    );
    promises.push(
      db.osoblje.findOrCreate({
        where: { ime: "Test", prezime: "Test", uloga: "asistent" }
      })
    );

    promises.push(db.sala.findOrCreate({ where: { naziv: "1-11" } }));
    promises.push(db.sala.findOrCreate({ where: { naziv: "1-15" } }));

    promises.push(
      db.termin.findOrCreate({
        where: {
          redovni: false,
          dan: null,
          datum: "01.01.2020",
          semestar: null,
          pocetak: "12:00",
          kraj: "13:00"
        }
      })
    );
    promises.push(
      db.termin.findOrCreate({
        where: {
          redovni: true,
          dan: 0,
          datum: null,
          semestar: "zimski",
          pocetak: "13:00",
          kraj: "14:00"
        }
      })
    );

    promises.push(db.rezervacija.findOrCreate({ where: { id: 1 } }));
    promises.push(db.rezervacija.findOrCreate({ where: { id: 2 } }));

    Promise.all(promises)
      .then(function(podaci) {
        podaci[3][0].setZaduzenoOsoblje(podaci[0][0]);
        podaci[4][0].setZaduzenoOsoblje(podaci[1][0]);

        podaci[7][0].setRezervisanaSala(podaci[3][0]);
        podaci[7][0].setTerminRezervacije(podaci[5][0]);
        podaci[7][0].setPredavac(podaci[0][0]);

        podaci[8][0].setRezervisanaSala(podaci[3][0]);
        podaci[8][0].setTerminRezervacije(podaci[6][0]);
        podaci[8][0].setPredavac(podaci[2][0]);
      })
      .catch(function(err) {
        console.log("Greska:" + err);
      });
  });
}

function initialize() {
  var osobljeListaPromisea = [];
  var terminiListaPromisea = [];
  var saleListaPromisea = [];
  var rezervacijeListaPromisea = [];

  return new Promise(function(resolve, reject) {
    osobljeListaPromisea.push(
      db.osoblje.create({
        id: 1,
        ime: "Neko",
        prezime: "Nekić",
        uloga: "profesor"
      })
    );
    osobljeListaPromisea.push(
      db.osoblje.create({
        id: 2,
        ime: "Drugi",
        prezime: "Neko",
        uloga: "asistent"
      })
    );
    osobljeListaPromisea.push(
      db.osoblje.create({
        id: 3,
        ime: "Test",
        prezime: "Test",
        uloga: "asistent"
      })
    );

    Promise.all(osobljeListaPromisea)
      .then(function(osoblje) {
        var neko = osoblje.filter(function(a) {
          return a.ime === "Neko" && a.prezime === "Nekić";
        })[0];
        var drugi = osoblje.filter(function(a) {
          return a.ime === "Drugi" && a.prezime === "Neko";
        })[0];
        var test = osoblje.filter(function(a) {
          return a.ime === "Test" && a.prezime === "Test";
        })[0];

        saleListaPromisea.push(
          db.sala
            .create({
              naziv: "1-11"
            })
            .then(function(s) {
              s.setZaduzenoOsoblje(neko);
              return new Promise(function(resolve, reject) {
                resolve(s);
              });
            })
        );
        saleListaPromisea.push(
          db.sala
            .create({
              naziv: "1-15"
            })
            .then(function(s) {
              s.setZaduzenoOsoblje(drugi);
              return new Promise(function(resolve, reject) {
                resolve(s);
              });
            })
        );

        Promise.all(saleListaPromisea)
          .then(function(sale) {
            terminiListaPromisea.push(
              db.termin.create({
                redovni: false,
                dan: null,
                datum: "01.01.2020",
                semestar: null,
                pocetak: "12:00",
                kraj: "13:00"
              })
            );
            terminiListaPromisea.push(
              db.termin.create({
                redovni: true,
                dan: 0,
                datum: null,
                semestar: "zimski",
                pocetak: "13:00",
                kraj: "14:00"
              })
            );

            Promise.all(terminiListaPromisea)
              .then(function(termini) {
                var jedan11 = sale.filter(function(s) {
                  return s.naziv === "1-11";
                })[0];

                var termin1 = termini.filter(function(t) {
                  return t.datum === "01.01.2020";
                })[0];

                var termin2 = termini.filter(function(t) {
                  return t.semestar === "zimski";
                })[0];

                rezervacijeListaPromisea.push(
                  db.rezervacija.create({}).then(function(r) {
                    r.setTerminRezervacije(termin1);
                    r.setRezervisanaSala(jedan11);
                    r.setPredavac(neko).then(function() {
                      return new Promise(function(resolve, reject) {
                        resolve(r);
                      });
                    });
                  })
                );
                rezervacijeListaPromisea.push(
                  db.rezervacija.create({}).then(function(r) {
                    r.setTerminRezervacije(termin2);
                    r.setRezervisanaSala(jedan11);
                    return r.setPredavac(test).then(function() {
                      return new Promise(function(resolve, reject) {
                        resolve(r);
                      });
                    });
                  })
                );
                Promise.all(rezervacijeListaPromisea)
                  .then(function(r) {
                    resolve(r);
                  })
                  .catch(function(err) {
                    console.log("Rezervacija greska" + err);
                  });
              })
              .catch(function(err) {
                console.log("Termin greska" + err);
              });
          })
          .catch(function(err) {
            console.log("Sale greska" + err);
          });
      })
      .catch(function(err) {
        console.log("Rezervacija greska" + err);
      });
  });
}
