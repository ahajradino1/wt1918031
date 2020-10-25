var trenutniMjesec = new Date().getMonth();
var trenutnaGodina = new Date().getFullYear();
var periodicne;
var vanredne;
// var periodicne = [
//   {
//     dan: 0,
//     semestar: "zimski",
//     pocetak: "10:00",
//     kraj: "12:00",
//     naziv: "VA1",
//     predavac: ""
//   },
//   {
//     dan: 3,
//     semestar: "ljetni",
//     pocetak: "13:10",
//     kraj: "14:59",
//     naziv: "MA",
//     predavac: ""
//   },
//   {
//     dan: 6,
//     semestar: "zimski",
//     pocetak: "09:30",
//     kraj: "15:00",
//     naziv: "MA",
//     predavac: ""
//   },
//   {
//     dan: 4,
//     semestar: "ljetni",
//     pocetak: "09:30",
//     kraj: "13:00",
//     naziv: "0-03",
//     predavac: ""
//   }
// ];

// var vanredne = [
//   {
//     datum: "12.11.2019",
//     pocetak: "11:15",
//     kraj: "12:30",
//     naziv: "0-01",
//     predavac: ""
//   },
//   {
//     datum: "06.11.2019",
//     pocetak: "09:45",
//     kraj: "12:00",
//     naziv: "VA1",
//     predavac: ""
//   },
//   {
//     datum: "21.11.2019",
//     pocetak: "10:00",
//     kraj: "10:12",
//     naziv: "MA",
//     predavac: ""
//   },
//   {
//     datum: "26.11.2019",
//     pocetak: "11:30",
//     kraj: "12:45",
//     naziv: "0-09",
//     predavac: ""
//   }
// ];
var sale = [];
let Kalendar = (function() {
  var vanredna;
  var periodicna;
  var mjeseci = [
    "JANUAR",
    "FEBRUAR",
    "MART",
    "APRIL",
    "MAJ",
    "JUN",
    "JUL",
    "AVGUST",
    "SEPTEMBAR",
    "OKTOBAR",
    "NOVEMBAR",
    "DECEMBAR"
  ];
  var dani = ["PON", "UTO", "SRI", "ČET", "PET", "SUB", "NED"];
  // var sale = [
  //   "1-11",
  //   "1-15"
  // "0-01",
  // "1-01",
  // "0-02",
  // "1-02",
  // "0-03",
  // "1-03",
  // "0-04",
  // "1-04",
  // "0-05",
  // "1-05",
  // "0-06",
  // "1-06",
  // "0-07",
  // "1-07",
  // "0-08",
  // "1-08",
  // "0-09",
  // "1-09",
  // "VA1",
  // "VA2",
  // "MA",
  // "EE1",
  // "EE2"
  // ];

  function obojiZauzecaImpl(
    kalendarRef,
    mjesec,
    sala,
    vrijemePocetka,
    vrijemeKraja
  ) {
    //ako postoje zauzete sale od prije, trebaju se osloboditi
    var td = kalendarRef.getElementsByTagName("td");
    for (var i = 0; i < td.length; i++) {
      if (td[i].className == "zauzeta") td[i].className = "slobodna";
    }

    var date = new Date(trenutnaGodina, trenutniMjesec, 1);
    var prviDan = date.getDay();
    var brojDana = new Date(trenutnaGodina, trenutniMjesec + 1, 0).getDate();
    if (prviDan == 0) prviDan = 6;
    else prviDan--;
    var brojReda;
    for (var i = 0; i < periodicna.length; i++) {
      brojReda = 2;
      if (
        vrijemePocetka.length > 0 &&
        vrijemeKraja.length > 0 &&
        sala == periodicna[i].naziv &&
        !(
          periodicna[i].kraj <= vrijemePocetka ||
          vrijemeKraja <= periodicna[i].pocetak
        ) &&
        // periodicna[i].pocetak >= vrijemePocetka &&
        // periodicna[i].kraj <= vrijemeKraja &&
        (((trenutniMjesec >= 9 || trenutniMjesec == 0) &&
          periodicna[i].semestar == "zimski") ||
          (trenutniMjesec >= 1 &&
            trenutniMjesec <= 5 &&
            periodicna[i].semestar == "ljetni"))
      ) {
        if (periodicna[i].dan < prviDan) brojReda++;
        for (var j = 0; j < prviDan + brojDana; j++) {
          if (j % 7 == 0) {
            if (brojReda >= kalendarRef.getElementsByTagName("tr").length)
              break;
            var tr = kalendarRef.getElementsByTagName("tr")[brojReda++];
            if (periodicna[i].dan >= tr.getElementsByTagName("td").length)
              break;
            var td = tr.getElementsByTagName("td")[periodicna[i].dan];
            td.className = "zauzeta";
          }
        }
      }
    }

    for (var i = 0; i < vanredna.length; i++) {
      var dd = vanredna[i].datum.substr(0, 2);
      var mm = vanredna[i].datum.substr(3, 2);
      var yyyy = vanredna[i].datum.substr(6, 4);
      if (
        vrijemePocetka.length > 0 &&
        vrijemeKraja.length > 0 &&
        sala == vanredna[i].naziv &&
        mm - 1 == mjesec &&
        yyyy == trenutnaGodina &&
        !(
          vanredna[i].kraj <= vrijemePocetka ||
          vrijemeKraja <= vanredna[i].pocetak
        )
        // vanredna[i].pocetak >= vrijemePocetka &&
        // vanredna[i].kraj <= vrijemeKraja
      ) {
        date = new Date(yyyy, mm - 1, 1);
        prviDan = date.getDay();
        if (prviDan == 0) prviDan = 6;
        else prviDan--;
        var td;
        if ((prviDan + parseInt(dd)) % 7 == 0)
          tr = kalendarRef.getElementsByTagName("tr")[
            parseInt((parseInt(dd) + prviDan) / 7) + 1
          ];
        else
          tr = kalendarRef.getElementsByTagName("tr")[
            parseInt((parseInt(dd) + prviDan) / 7) + 2
          ];

        var pozicija = ((parseInt(dd) + prviDan) % 7) - 1;
        if (pozicija == -1) pozicija = 6;
        var td = tr.getElementsByTagName("td")[pozicija];
        td.className = "zauzeta";
      }
    }
  }

  function ucitajPodatkeImpl(periodicneRez, vanredneRez) {
    periodicna = new Array();
    vanredna = new Array();
    for (let i = 0; i < periodicneRez.length; i++)
      if (
        !(
          periodicneRez[i].dan < 0 ||
          periodicneRez[i].dan > 6 ||
          (periodicneRez[i].semestar != "zimski" &&
            periodicneRez[i].semestar != "ljetni") ||
          periodicneRez[i].pocetak > periodicneRez[i].kraj ||
          !sale.includes(periodicneRez[i].naziv)
        )
      ) {
        periodicna.push(periodicneRez[i]);
      }

    for (let i = 0; i < vanredneRez.length; i++) {
      if (
        !(
          vanredneRez[i].pocetak > vanredneRez[i].kraj ||
          !sale.includes(vanredneRez[i].naziv)
        )
      ) {
        vanredna.push(vanredneRez[i]);
      }
    }
    periodicne = periodicna;
    vanredne = vanredna;
  }

  function iscrtajKalendarImpl(kalendarRef, mjesec) {
    var trenutniDatum = new Date(trenutnaGodina, mjesec, 1);
    //vraca redni broj dana 0-nedelja, 6-subota
    var prviDan = trenutniDatum.getDay();
    if (prviDan == 0) prviDan = 6;
    else prviDan--;

    var res = document.createElement("table");
    res.className = "kalendar";

    var tr = document.createElement("tr");
    tr.className = "mjesec";
    var th = document.createElement("th");
    th.colSpan = 7;
    th.innerHTML = mjeseci[mjesec];

    tr.appendChild(th);
    res.appendChild(tr);

    tr = document.createElement("tr");
    tr.className = "dani";
    for (var i = 0; i < 7; i++) {
      var td = document.createElement("td");
      td.innerHTML = dani[i];
      tr.appendChild(td);
    }

    res.appendChild(tr);

    var brojDana = new Date(trenutnaGodina, mjesec + 1, 0).getDate();

    for (var i = 0; i < brojDana + prviDan; i++) {
      if (i % 7 == 0) tr = document.createElement("tr");

      td = document.createElement("td");

      if (i < prviDan || i > brojDana + prviDan) {
        td.innerHTML = " ";
        td.className = "prikazi";
      } else {
        td.innerHTML = i - prviDan + 1;
        td.className = "slobodna not-prva";
      }
      tr.appendChild(td);
      res.appendChild(tr);
    }

    kalendarRef.replaceWith(res);
  }

  return {
    obojiZauzeca: obojiZauzecaImpl,
    ucitajPodatke: ucitajPodatkeImpl,
    iscrtajKalendar: iscrtajKalendarImpl
  };
})();

// function prethodni(buttonRef) {
//   var dugme = document.getElementsByTagName(buttonRef);
//   if (trenutniMjesec - 1 < 0) dugme.disabled = true;
//   else {
//     Kalendar.iscrtajKalendar(
//       document.getElementsByClassName("kalendar")[0],
//       --trenutniMjesec
//     );
//     Kalendar.ucitajPodatke(periodicne, vanredne);
//     Kalendar.obojiZauzeca(
//       document.getElementsByClassName("kalendar")[0],
//       trenutniMjesec,
//       document.getElementsByTagName("option")[spisakSala.selectedIndex].value,
//       pocetakRezervacije.value,
//       krajRezervacije.value
//     );
//   }
// }

// function sljedeci(buttonRef) {
//   var dugme = document.getElementsByTagName(buttonRef);
//   if (trenutniMjesec + 1 > 11) dugme.disabled = true;
//   else {
//     Kalendar.iscrtajKalendar(
//       document.getElementsByClassName("kalendar")[0],
//       ++trenutniMjesec
//     );
//     Kalendar.ucitajPodatke(periodicne, vanredne);
//     Kalendar.obojiZauzeca(
//       document.getElementsByClassName("kalendar")[0],
//       trenutniMjesec,
//       document.getElementsByTagName("option")[spisakSala.selectedIndex].value,
//       pocetakRezervacije.value,
//       krajRezervacije.value
//     );
//   }
// }

// Kalendar.iscrtajKalendar(
//   document.getElementsByClassName("kalendar")[0],
//   trenutniMjesec
// );

// var spisakSala = document.getElementById("sale");
// var pocetakRezervacije = document.getElementById("pocetak");
// var krajRezervacije = document.getElementById("kraj");
// var rezervacije = document.getElementsByClassName("rezervacije")[0];
// rezervacije.addEventListener("change", function() {
//   //da ne bi ostale promjene od prethodne selekcije
//   Kalendar.iscrtajKalendar(
//     document.getElementsByClassName("kalendar")[0],
//     trenutniMjesec
//   );
//   var selektovanaSala = document.getElementsByTagName("option")[
//     spisakSala.selectedIndex
//   ].value;
//   Kalendar.ucitajPodatke(periodicne, vanredne);
//   Kalendar.obojiZauzeca(
//     document.getElementsByClassName("kalendar")[0],
//     trenutniMjesec,
//     selektovanaSala,
//     pocetakRezervacije.value,
//     krajRezervacije.value
//   );
// });
