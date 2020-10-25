var btnPrethodni;
var btnSljedeci;
var brojSlika;
var brojUcitanih = 0;
var sadrzaj;
var btnClicked = 1;
var ucitano = 1;
var sveUcitano = false; //pokazuje da li su sve slike ucitane sa servera
window.onload = function() {
  sadrzaj = document.getElementsByClassName("sadrzaj")[0];
  btnPrethodni = document.getElementById("previous");
  btnSljedeci = document.getElementById("next");
  Pozivi.ucitajSlike(izdvojiSlike);
  sessionStorage.clear();
};

function izdvojiSlike(vel) {
  brojSlika = vel;
  for (var i = 0; i < 3; i++) {
    if (brojUcitanih < brojSlika) {
      Pozivi.ucitajSliku(sadrzaj, sacuvajUrl);
      brojUcitanih++;
    }
  }
  if (brojSlika <= 3) {
    btnPrethodni.disabled = true;
    btnSljedeci.disabled = true;
  }
}

function next() {
  if (sveUcitano == false && btnClicked * 3 >= sessionStorage.length) {
    btnClicked++;
    sadrzaj.innerHTML = "";
    for (var i = 0; i < 3; i++) {
      if (brojUcitanih < brojSlika) {
        Pozivi.ucitajSliku(sadrzaj, sacuvajUrl);
        brojUcitanih++;
      } else {
        btnSljedeci.disabled = true;
        sveUcitano = true;
      }
    }
  } else {
    if (btnClicked * 3 >= sessionStorage.length) {
      btnSljedeci.disabled = true;
      btnClicked--;
    } else if (
      btnClicked * 3 + (sessionStorage.length % 3) ==
      sessionStorage.length
    ) {
      var novi = "";
      for (var j = 0; j < sessionStorage.length % 3; j++) {
        url1 = sessionStorage.getItem(btnClicked * 3 + 1 + j);
        novi += "<img src='" + url1 + "'>";
      }
      sadrzaj.innerHTML = novi;
    } else {
      url1 = sessionStorage.getItem(btnClicked * 3 + 1);
      url2 = sessionStorage.getItem(btnClicked * 3 + 2);
      url3 = sessionStorage.getItem(btnClicked * 3 + 3);
      sadrzaj.innerHTML =
        "<img src='" +
        url1 +
        "'> <img src='" +
        url2 +
        "'> <img src='" +
        url3 +
        "'>";
    }
    btnClicked++;
    if (btnClicked != 1) btnPrethodni.disabled = false;
  }
}

function previous() {
  btnClicked--;
  btnSljedeci.disabled = false;

  url1 = sessionStorage.getItem(btnClicked * 3);
  url2 = sessionStorage.getItem(btnClicked * 3 - 1);
  url3 = sessionStorage.getItem(btnClicked * 3 - 2);
  sadrzaj.innerHTML =
    "<img src='" +
    url1 +
    "'> <img src='" +
    url2 +
    "'> <img src='" +
    url3 +
    "'>";
  if (btnClicked == 1) {
    btnPrethodni.disabled = true;
  }
}

function sacuvajUrl(url) {
  sessionStorage.setItem(ucitano++, url);
}
