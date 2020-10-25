const server = require("./index");
const app = server.app;
let chai = require("chai");
let chaiHttp = require("chai-http");
const db = require("./db.js");
let expect = chai.expect;
let assert = chai.assert;
chai.use(chaiHttp);

describe("Tests", function() {
  before(function(done) {
    this.enableTimeouts = false;
    db.sequelize
      .sync({ force: true })
      .then(() => {
        server.init();
      })
      .then(() => {
        done();
      });
  });

  after(function(done) {
    this.enableTimeouts = false;
    db.sequelize.sync({ force: true }).then(() => done());
  });

  describe("GET /osoblje", function() {
    it("status treba biti 200", done => {
      chai
        .request(app)
        .get("/osoblje")
        .end((err, res) => {
          expect(res.status).to.eql(200);
          if (err) done(err);
          else done();
        });
    });

    it("treba vratiti 3 osobe", done => {
      chai
        .request(app)
        .get("/osoblje")
        .end((err, res) => {
          expect(res.text).to.be.a("string");
          expect(JSON.parse(res.text)).to.have.lengthOf(3);
          if (err) done(err);
          else done();
        });
    });

    it("treba vratiti 3 ispravne osobe", done => {
      chai
        .request(app)
        .get("/osoblje")
        .end((err, res) => {
          expect(JSON.parse(res.text)).eql([
            { ime: "Neko", prezime: "Nekić", uloga: "profesor" },
            { ime: "Drugi", prezime: "Neko", uloga: "asistent" },
            { ime: "Test", prezime: "Test", uloga: "asistent" }
          ]);
          if (err) done(err);
          else done();
        });
    });
  });

  describe("Dohvatanje svih zauzeca", function() {
    it("treba dohvatiti 2 zauzeca", done => {
      chai
        .request(app)
        .get("/sveRezervacije")
        .end((err, res) => {
          expect(JSON.parse(res.text)).eql({
            redovna: [
              {
                dan: 0,
                semestar: "zimski",
                pocetak: "13:00",
                kraj: "14:00",
                naziv: "1-11",
                predavac: "Test Test asistent"
              }
            ],
            vanredna: [
              {
                datum: "01.01.2020",
                pocetak: "12:00",
                kraj: "13:00",
                naziv: "1-11",
                predavac: "Neko Nekić profesor"
              }
            ]
          });
          if (err) done(err);
          else done();
        });
    });

    it("treba se dodati novo zauzece", done => {
      let zauzece = {
        datum: "21.01.2020",
        pocetak: "12:00",
        kraj: "12:45",
        naziv: "1-01",
        predavac: "Predavac Broj1"
      };
      chai
        .request(app)
        .post("/rezervacija")
        .send(zauzece)
        .end((err, res) => {
          expect(res.status).to.eql(200);
          expect(JSON.parse(res.text).zauzeca.vanredna).to.have.lengthOf(2);
          if (err) done(err);
          else done();
        });
    });

    describe("Dohvatanje svih sala", function() {
      it("treba vratiti status 200", done => {
        chai
          .request(app)
          .get("/sale")
          .end((err, res) => {
            expect(res.status).to.eql(200);
            if (err) done(err);
            else done();
          });
      });
      it("treba dohvatiti 3 sale", done => {
        chai
          .request(app)
          .get("/sale")
          .end((err, res) => {
            console.log(JSON.parse(res.text));
            expect(JSON.parse(res.text)).eql([
              { naziv: "1-11" },
              { naziv: "1-15" },
              { naziv: "1-01" }
            ]);
            if (err) done(err);
            else done();
          });
      });
    });

    describe("Kreiranje nove rezervacije", function() {
      it("treba se dodati nova rezervacija", done => {
        let zauzece = {
          datum: "21.04.2020",
          pocetak: "12:00",
          kraj: "12:45",
          naziv: "1-11",
          predavac: "Predavac Broj1"
        };
        chai
          .request(app)
          .post("/rezervacija")
          .send(zauzece)
          .end((err, res) => {
            expect(res.status).to.eql(200);
            expect(JSON.parse(res.text).zauzeca.vanredna).to.have.lengthOf(3);
            if (err) done(err);
            else done();
          });
      });
      it("rezervacija se ne dodaje zbog preklapanja", done => {
        let zauzece = {
          datum: "01.01.2020",
          pocetak: "12:00",
          kraj: "13:00",
          naziv: "1-11",
          predavac: "Predavac 2 asistent"
        };
        chai
          .request(app)
          .post("/rezervacija")
          .send(zauzece)
          .end((err, res) => {
            assert.isNotEmpty(JSON.parse(res.text).error);
            if (err) done(err);
            else done();
          });
      });
      it("treba se dodati nova periodicna rezervacija", done => {
        let zauzece = {
          dan: 4,
          semestar: "ljetni",
          pocetak: "14:00",
          kraj: "14:50",
          naziv: "1-15",
          predavac: "Neko Nekić"
        };
        chai
          .request(app)
          .post("/rezervacija")
          .send(zauzece)
          .end((err, res) => {
            expect(JSON.parse(res.text).zauzeca.redovna).to.have.lengthOf(2);
            if (err) done(err);
            else done();
          });
      });
    });
  });
});
