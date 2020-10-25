var trenutniMjesec = new Date().getMonth();
var trenutnaGodina = new Date().getFullYear();
var spisakSala;
var pocetakRezervacije;
var krajRezervacije;
var rezervacije;
var prethodniBtn;
var sljedeciBtn;
var spisakOsoblja;
window.onload = function() {
  spisakSala = document.getElementById("sale");
  pocetakRezervacije = document.getElementById("pocetak");
  krajRezervacije = document.getElementById("kraj");
  rezervacije = document.getElementsByClassName("rezervacije")[0];
  prethodniBtn = document.getElementById("prethodni");
  sljedeciBtn = document.getElementById("sljedeci");
  spisakOsoblja = document.getElementById("osoblje");
  Pozivi.ucitajOsoblje(dodajOsoblje);
  Pozivi.ucitajSale(dodajSale);

  Pozivi.ucitajRezervacije(ucitajJson);
  rezervacije.addEventListener("change", function() {
    Pozivi.ucitajRezervacije(ucitajJson);
  });
};

function ucitajJson(zauzeca) {
  var podaci = JSON.parse(zauzeca);
  periodicne = podaci.redovna;
  vanredne = podaci.vanredna;
  Kalendar.iscrtajKalendar(
    document.getElementsByClassName("kalendar")[0],
    trenutniMjesec
  );
  Kalendar.ucitajPodatke(podaci.redovna, podaci.vanredna);
  var selektovanaSala = spisakSala.getElementsByTagName("option")[
    spisakSala.selectedIndex
  ].value;
  var selektovanaOsoba = spisakOsoblja.getElementsByTagName("option")[
    spisakOsoblja.selectedIndex
  ].value;
  Kalendar.obojiZauzeca(
    document.getElementsByClassName("kalendar")[0],
    trenutniMjesec,
    selektovanaSala,
    pocetakRezervacije.value,
    krajRezervacije.value
  );

  var td = document.getElementsByTagName("td");
  for (let i = 0; i < td.length; i++) {
    td.item(i).addEventListener("click", function() {
      var dan = td.item(i).innerText;
      var date = new Date(trenutnaGodina, trenutniMjesec, 1);
      prviDan = date.getDay();
      if (prviDan == 0) prviDan = 6;
      else prviDan--;

      var selektovanaSala = document.getElementsByTagName("option")[
        spisakSala.selectedIndex
      ].value;

      var jeLiPeriodicna = document.getElementById("periodicnost");
      if (
        jeLiPeriodicna.checked &&
        !jeLiValidnaPeriodicna(
          prviDan,
          dan,
          trenutniMjesec + 1,
          pocetakRezervacije.value,
          krajRezervacije.value,
          selektovanaSala
        )
      ) {
        alert(
          "Ne možete napraviti periodičnu rezervaciju za " +
            dan +
            "." +
            (trenutniMjesec + 1) +
            "." +
            trenutnaGodina +
            "!"
        );
      } else {
        if (validirajConfirm(td.item(i)) == true) {
          var potvrda = confirm(
            "Odabrali ste " +
              dan +
              ". dan u mjesecu. Da li želite rezervisati ovaj termin?"
          );
          if (potvrda == true) {
            var rezervacija = new Object();

            var date = new Date(trenutnaGodina, trenutniMjesec, 1);
            prviDan = date.getDay();
            if (prviDan == 0) prviDan = 6;
            else prviDan--;
            if (jeLiPeriodicna.checked) {
              zauzetiDan = parseInt((parseInt(dan) + prviDan) % 7) - 1;
              if (zauzetiDan == -1) zauzetiDan = 6;
              rezervacija["dan"] = zauzetiDan;
              if (trenutniMjesec >= 9 || trenutniMjesec == 0)
                rezervacija["semestar"] = "zimski";
              else if (trenutniMjesec >= 1 && trenutniMjesec <= 5)
                rezervacija["semestar"] = "ljetni";
            } else {
              var mjesec = trenutniMjesec + 1;
              if (mjesec < 10) mjesec = "0" + mjesec;
              if (dan < 10) {
                dan = "0" + dan;
              }
              rezervacija["datum"] = dan + "." + mjesec + "." + trenutnaGodina;
            }

            rezervacija["pocetak"] = pocetakRezervacije.value;
            rezervacija["kraj"] = krajRezervacije.value;
            rezervacija["naziv"] = selektovanaSala;
            rezervacija["predavac"] = selektovanaOsoba;
            Pozivi.upisiRezervaciju(rezervacija, dodaneRezervacije, greska);
          }
        }
      }
    });
  }
}

function validirajConfirm(td) {
  var ok = true;
  if (pocetakRezervacije.value.length == 0 || krajRezervacije.value.length == 0)
    return false;
  if (td.classList.contains("zauzeta")) return false;
  if (!td.classList.contains("zauzeta") && !td.classList.contains("slobodna"))
    return false;
  return ok;
}

function prethodni(buttonRef) {
  var dugme = document.getElementsByTagName(buttonRef);
  if (trenutniMjesec - 1 < 0) dugme.disabled = true;
  else {
    trenutniMjesec--;
    Pozivi.ucitajRezervacije(ucitajJson);
  }
}

function sljedeci(buttonRef) {
  var dugme = document.getElementsByTagName(buttonRef);
  if (trenutniMjesec + 1 > 11) dugme.disabled = true;
  else {
    trenutniMjesec++;
    Pozivi.ucitajRezervacije(ucitajJson);
  }
}

function greska(poruka) {
  if (typeof poruka != "undefined") {
    alert(poruka);
  }
}

function dodaneRezervacije(rezervacije) {
  if (typeof rezervacije != "undefined") {
    ucitajJson(JSON.stringify(rezervacije));
  }
}

function dodajOsoblje(spisak) {
  spisak = JSON.parse(spisak);
  var option;
  for (var i = 0; i < spisak.length; i++) {
    option = document.createElement("option");
    option.text = spisak[i].ime + " " + spisak[i].prezime;
    if (spisak[i].uloga != null) option.text += ", " + spisak[i].uloga;
    spisakOsoblja.add(option);
  }
}

function dodajSale(spisak) {
  spisak = JSON.parse(spisak);
  var option;
  for (var i = 0; i < spisak.length; i++) {
    option = document.createElement("option");
    option.text = spisak[i].naziv;
    sale.push(spisak[i].naziv);
    option.value = spisak[i].naziv;
    spisakSala.add(option);
  }
}

function jeLiValidnaPeriodicna(
  prvi_dan,
  dan,
  mjesec,
  vrijemePocetka,
  vrijemeKraja,
  sala
) {
  if (mjesec >= 7 && mjesec <= 9) {
    return false;
  }
  var semestarKlik;
  var semestarVanredni;
  if (mjesec == 1 || mjesec > 9) {
    semestarKlik = "zimski";
  } else if (mjesec >= 2 && mjesec <= 6) {
    semestarKlik = "ljetni";
  }
  if (mjesec < 10) mjesec = "0" + mjesec;

  for (var i = 0; i < vanredne.length; i++) {
    var dd = vanredne[i].datum.substr(0, 2);
    var mm = vanredne[i].datum.substr(3, 2);
    var yyyy = vanredne[i].datum.substr(6, 4);
    date = new Date(yyyy, mm - 1, 1);
    prviDan = date.getDay();
    if (prviDan == 0) prviDan = 6;
    else prviDan--;

    if (mm == 1 || mm > 8) {
      semestarVanredni = "zimski";
    } else if (mm >= 2 && mm <= 6) {
      semestarVanredni = "ljetni";
    }

    if (
      vanredne[i].naziv == sala &&
      !(
        vanredne[i].kraj <= vrijemePocetka ||
        vrijemeKraja <= vanredne[i].pocetak
      ) &&
      semestarVanredni == semestarKlik &&
      (parseInt(dan) + prvi_dan) % 7 == (parseInt(dd) + prviDan) % 7
    )
      return false;
  }
  return true;
}

Kalendar.iscrtajKalendar(
  document.getElementsByClassName("kalendar")[0],
  trenutniMjesec
);
