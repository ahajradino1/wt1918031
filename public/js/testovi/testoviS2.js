let assert = chai.assert;
describe("Kalendar", function() {
  describe("obojiZauzeca()", function() {
    it("sve sale trebaju biti slobodne kada nisu ucitani podaci", function() {
      Kalendar.iscrtajKalendar(
        document.getElementsByClassName("kalendar")[0],
        10
      );
      Kalendar.ucitajPodatke([], []);
      Kalendar.obojiZauzeca(
        document.getElementsByClassName("kalendar")[0],
        10,
        "0-01",
        "14:00",
        "17:10"
      );
      assert.equal(
        document.getElementsByClassName("zauzeta").length,
        0,
        "Trenutno su sve sale slobodne!"
      );
    });
    it("dan se treba obojiti i kada postoje duple rezervacije", function() {
      let vanredna = [
        {
          datum: "21.11.2019",
          pocetak: "10:00",
          kraj: "12:00",
          naziv: "VA1",
          predavac: ""
        },
        {
          datum: "21.11.2019",
          pocetak: "10:00",
          kraj: "12:00",
          naziv: "VA1",
          predavac: ""
        }
      ];
      Kalendar.iscrtajKalendar(
        document.getElementsByClassName("kalendar")[0],
        10
      );
      Kalendar.ucitajPodatke([], vanredna);
      Kalendar.obojiZauzeca(
        document.getElementsByClassName("kalendar")[0],
        10,
        "VA1",
        "09:00",
        "12:10"
      );
      assert.equal(
        document.getElementsByClassName("zauzeta").length,
        1,
        "Trenutno je zauzeta jedna sala"
      );
    });
    it("periodicno zauzece se ne treba obojiti ako trenutni mjesec nije u semestru iz podataka", function() {
      Kalendar.iscrtajKalendar(
        document.getElementsByClassName("kalendar")[0],
        10
      );
      Kalendar.ucitajPodatke(
        [
          {
            dan: 4,
            semestar: "ljetni",
            pocetak: "13:30",
            kraj: "15:00",
            naziv: "MA",
            predavac: ""
          }
        ],
        []
      );
      Kalendar.obojiZauzeca(
        document.getElementsByClassName("kalendar")[0],
        10,
        "MA",
        "13:30",
        "15:00"
      );
      assert.equal(
        document.getElementsByClassName("zauzeta").length,
        0,
        "Nema periodicnih zauzeca u novembru!"
      );
    });
    it("zauzece se ne treba obojiti ako trenutni mjesec ne odgovara onom mjesecu iz podataka", function() {
      Kalendar.iscrtajKalendar(
        document.getElementsByClassName("kalendar")[0],
        7
      );
      Kalendar.ucitajPodatke(
        [],
        [
          {
            datum: "21.11.2019",
            pocetak: "10:00",
            kraj: "12:00",
            naziv: "VA1",
            predavac: ""
          }
        ]
      );
      Kalendar.obojiZauzeca(
        document.getElementsByClassName("kalendar")[0],
        7,
        "VA1",
        "9:30",
        "13:00"
      );
      assert.equal(
        document.getElementsByClassName("zauzeta").length,
        0,
        "Nema zauzeca u avgustu!"
      );
    });

    it("trebaju se obojiti svi dani u mjesecu", function() {
      Kalendar.iscrtajKalendar(
        document.getElementsByClassName("kalendar")[0],
        10
      );
      Kalendar.ucitajPodatke(
        [
          {
            dan: 0,
            semestar: "zimski",
            pocetak: "09:30",
            kraj: "13:00",
            naziv: "VA1",
            predavac: ""
          },
          {
            dan: 1,
            semestar: "zimski",
            pocetak: "09:30",
            kraj: "13:00",
            naziv: "VA1",
            predavac: ""
          },
          {
            dan: 3,
            semestar: "zimski",
            pocetak: "09:30",
            kraj: "13:00",
            naziv: "VA1",
            predavac: ""
          },
          {
            dan: 4,
            semestar: "zimski",
            pocetak: "09:30",
            kraj: "13:00",
            naziv: "VA1",
            predavac: ""
          },
          {
            dan: 5,
            semestar: "zimski",
            pocetak: "09:30",
            kraj: "13:00",
            naziv: "VA1",
            predavac: ""
          },
          {
            dan: 6,
            semestar: "zimski",
            pocetak: "09:30",
            kraj: "13:00",
            naziv: "VA1",
            predavac: ""
          }
        ],
        [
          {
            datum: "06.11.2019",
            pocetak: "09:45",
            kraj: "12:00",
            naziv: "VA1",
            predavac: ""
          },
          {
            datum: "13.11.2019",
            pocetak: "10:00",
            kraj: "12:00",
            naziv: "VA1",
            predavac: ""
          },
          {
            datum: "20.11.2019",
            pocetak: "10:00",
            kraj: "12:00",
            naziv: "VA1",
            predavac: ""
          },
          {
            datum: "27.11.2019",
            pocetak: "09:45",
            kraj: "12:00",
            naziv: "VA1",
            predavac: ""
          }
        ]
      );
      Kalendar.obojiZauzeca(
        document.getElementsByClassName("kalendar")[0],
        10,
        "VA1",
        "09:30",
        "13:00"
      );
      assert.equal(
        document.getElementsByClassName("zauzeta").length,
        30,
        "Sala je zauzeta tokom citavog mjeseca!"
      );
    });
    it("trebaju ostati obojeni isti dani nakon ponovnog poziva funkcije", function() {
      Kalendar.iscrtajKalendar(
        document.getElementsByClassName("kalendar")[0],
        10
      );
      Kalendar.ucitajPodatke(
        [],
        [
          {
            datum: "01.11.2019",
            pocetak: "11:15",
            kraj: "12:30",
            naziv: "0-01",
            predavac: ""
          },
          {
            datum: "20.11.2019",
            pocetak: "12:30",
            kraj: "14:00",
            naziv: "0-01",
            predavac: ""
          }
        ]
      );
      Kalendar.obojiZauzeca(
        document.getElementsByClassName("kalendar")[0],
        10,
        "0-01",
        "11:11",
        "14:30"
      );
      var brojZauzetihPrije = document.getElementsByClassName("zauzeta").length;
      Kalendar.obojiZauzeca(
        document.getElementsByClassName("kalendar")[0],
        10,
        "0-01",
        "11:11",
        "14:30"
      );
      var brojZauzetihPoslije = document.getElementsByClassName("zauzeta")
        .length;
      assert.isTrue(
        brojZauzetihPrije == brojZauzetihPoslije,
        "Zauzece dana treba biti nepromijenjeno!"
      );
    });
    it("dani trebaju biti obojeni na osnovu najnovijih podataka", function() {
      Kalendar.iscrtajKalendar(
        document.getElementsByClassName("kalendar")[0],
        10
      );
      var vanredni = [
        {
          datum: "12.11.2019",
          pocetak: "11:15",
          kraj: "13:30",
          naziv: "0-01",
          predavac: ""
        },
        {
          datum: "20.11.2019",
          pocetak: "13:30",
          kraj: "14:00",
          naziv: "0-01",
          predavac: ""
        }
      ];
      Kalendar.ucitajPodatke([], vanredni);
      Kalendar.obojiZauzeca(
        document.getElementsByClassName("kalendar")[0],
        10,
        "0-01",
        "11:30",
        "14:30"
      );
      vanredni = [
        {
          datum: "01.11.2019",
          pocetak: "11:15",
          kraj: "12:30",
          naziv: "0-01",
          predavac: ""
        }
      ];
      Kalendar.ucitajPodatke([], vanredni);
      Kalendar.obojiZauzeca(
        document.getElementsByClassName("kalendar")[0],
        10,
        "0-01",
        "11:30",
        "14:30"
      );
      assert.equal(
        document.getElementsByClassName("zauzeta").length,
        1,
        "Ucitani su noviji podaci!"
      );
    });
    it("ne trebaju se obojiti nevalidni podaci", function() {
      var vanredni = [
        {
          datum: "01.11.2019",
          pocetak: "14:15",
          kraj: "12:30",
          naziv: "0-01",
          predavac: ""
        }
      ];
      Kalendar.iscrtajKalendar(
        document.getElementsByClassName("kalendar")[0],
        10
      );
      Kalendar.ucitajPodatke([], vanredni);
      Kalendar.obojiZauzeca(
        document.getElementsByClassName("kalendar")[0],
        10,
        "0-01",
        "10:00",
        "20:00"
      );
      assert.equal(
        document.getElementsByClassName("zauzeta").length,
        0,
        "Vrijeme pocetka rezervacije mora biti prije kraja rezervacije!"
      );
    });
    it("potrebno je obojiti svaki dan u mjesecu iz periodicnog zauzeca", function() {
      Kalendar.iscrtajKalendar(
        document.getElementsByClassName("kalendar")[0],
        10
      );
      var periodicna = [
        {
          dan: 4,
          semestar: "zimski",
          pocetak: "09:30",
          kraj: "13:00",
          naziv: "0-03",
          predavac: ""
        }
      ];
      Kalendar.ucitajPodatke(periodicna, []);
      Kalendar.obojiZauzeca(
        document.getElementsByClassName("kalendar")[0],
        10,
        "0-03",
        "10:00",
        "13:00"
      );
      assert.equal(
        5,
        document.getElementsByClassName("zauzeta").length,
        "Svaki petak u mjesecu je zauzet!"
      );
    });
  });

  describe("iscrtajKalendar()", function() {
    it("potrebno je prikazati mjesec sa 30 dana", function() {
      Kalendar.iscrtajKalendar(
        document.getElementsByClassName("kalendar")[0],
        10
      );
      let slobodne = document.getElementsByClassName("slobodna");
      assert.equal(slobodne.length, 30, "Mjesec novembar ima 30 dana!");
    });
    it("potrebno je prikazati mjesec sa 31 danom", function() {
      Kalendar.iscrtajKalendar(
        document.getElementsByClassName("kalendar")[0],
        6
      );
      let slobodne = document.getElementsByClassName("slobodna");
      assert.equal(slobodne.length, 31, "Mjesec jul ima 31 dan!");
    });
    it("potrebno je da prvi dan bude petak (trenutni mjesec = novembar)", function() {
      Kalendar.iscrtajKalendar(
        document.getElementsByClassName("kalendar")[0],
        10
      );
      let slobodne = document.getElementsByClassName("slobodna");
      assert.equal(slobodne[0].innerText, 1, "Prvi dan novembra je petak!");
    });
    it("potrebno je da poslednji dan bude subota (trenutni mjesec = novembar)", function() {
      Kalendar.iscrtajKalendar(
        document.getElementsByClassName("kalendar")[0],
        10
      );
      let slobodne = document.getElementsByClassName("slobodna");
      assert.equal(
        slobodne[29].innerText,
        30,
        "Poslednji dan novembra je subota!"
      );
    });
    it("potrebno je da dani u januaru idu od 1 do 31", function() {
      Kalendar.iscrtajKalendar(
        document.getElementsByClassName("kalendar")[0],
        0
      );
      let slobodne = document.getElementsByClassName("slobodna");
      assert.equal(slobodne[0].innerText, 1, "Januar pocinje u utorak!");
      assert.equal(slobodne.length, 31, "Januar ima 31 dan!");
    });
    it("potrebno je prikazati 28 dana", function() {
      Kalendar.iscrtajKalendar(
        document.getElementsByClassName("kalendar")[0],
        1
      );
      assert.equal(
        28,
        document.getElementsByClassName("slobodna").length,
        "Februar 2019.godine ima 28 dana!"
      );
    });
    it("svi dani trebaju biti slobodni", function() {
      Kalendar.iscrtajKalendar(
        document.getElementsByClassName("kalendar")[0],
        7
      );
      assert.equal(
        31,
        document.getElementsByClassName("slobodna").length,
        "Cijeli avgust je slobodan!"
      );
    });
  });
});
