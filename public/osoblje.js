var osobe = [];
var tabela;
var rezervacije;
let osobaSala = [];
window.onload = function() {
  tabela = document.getElementById("osobe");
  Pozivi.ucitajOsoblje(dajOsoblje);
  // Pozivi.ucitajRezervacije(updateOsoba);
};

window.setInterval(function() {
  Pozivi.ucitajOsoblje(dajOsoblje);
}, 10000);

function dajOsoblje(spisak) {
  osobaSala = [];
  osobe = JSON.parse(spisak);
  for (var i = 0; i < osobe.length; i++) {
    osobaSala[osobe[i].ime + " " + osobe[i].prezime] = "U kancelariji";
  }
  Pozivi.ucitajRezervacije(updateOsoba);
}

function updateHtml() {
  var res = '<table id="osobe"><tr><th>OSOBLJE</th><th>SALA</th></tr>';
  for (var key in osobaSala) {
    res += "<tr><td>" + key + "</td><td>" + osobaSala[key] + "</td></tr>";
  }
  res += "</table>";
  document.getElementById("osobe").innerHTML = res;
}

function updateOsoba(podaci) {
  rezervacije = JSON.parse(podaci);
  var trenutniMjesec = new Date().getMonth();
  var trenutnaGodina = new Date().getFullYear();
  var trenutniSati = new Date().getHours();
  var trenutniMinuti = new Date().getMinutes();
  if (trenutniSati < 10) {
    trenutniSati = "0" + trenutniSati.toString();
  }
  if (trenutniMinuti < 10) {
    trenutniMinuti = "0" + trenutniMinuti.toString();
  }
  for (var i = 0; i < rezervacije.redovna.length; i++) {
    var p = trenutniSati + ":" + trenutniMinuti;
    var dateString = new Date().toLocaleDateString("en-BS");
    var mjesec = parseInt(dateString.substr(3, 2));
    mjesec--;
    var prviDan = new Date().getDay();
    var dd = dateString.substr(0, 2);
    if (prviDan == 0) prviDan = 6;
    else prviDan--;
    if (
      ((rezervacije.redovna[i].semestar == "zimski" &&
        (mjesec == 0 || mjesec >= 9)) ||
        (rezervacije.redovna[i].semestar == "ljetni" &&
          mjesec >= 1 &&
          mjesec <= 5)) &&
      (parseInt(dd) + prviDan) % 7 == rezervacije.redovna[i].dan &&
      rezervacije.redovna[i].pocetak <= p &&
      p <= rezervacije.redovna[i].kraj
    ) {
      var a = rezervacije.redovna[i].predavac.replace(",", "").split(" ");
      predavac = a[0] + " " + a[1];
      osobaSala[predavac] = rezervacije.redovna[i].naziv;
    }
  }
  for (var i = 0; i < rezervacije.vanredna.length; i++) {
    var p = trenutniSati + ":" + trenutniMinuti;
    var dateString = new Date().toLocaleDateString("en-BS");
    var trenutniDatum =
      dateString.substr(0, 2) +
      "." +
      dateString.substr(3, 2) +
      "." +
      trenutnaGodina;
    if (
      trenutniDatum == rezervacije.vanredna[i].datum &&
      rezervacije.vanredna[i].pocetak <= p &&
      p <= rezervacije.vanredna[i].kraj
    ) {
      var a = rezervacije.vanredna[i].predavac.replace(",", "").split(" ");
      predavac = a[0] + " " + a[1];
      osobaSala[predavac] = rezervacije.vanredna[i].naziv;
    }
  }
  // for (var key in osobaSala) {
  //   if (osobaSala[key] == "") osobaSala[key] = "U kancelariji";
  // }
  updateHtml();
}
