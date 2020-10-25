let Pozivi = (function() {
  //
  //ovdje idu privatni atributi
  //
  function upisiZauzeceImpl(zauzece, fnCallbackOK, fnCallbackError) {
    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function() {
      if (ajax.readyState == 4 && ajax.status == 200) {
        var jsonResult = JSON.parse(ajax.responseText);
        fnCallbackOK(jsonResult.zauzeca);
        fnCallbackError(jsonResult.error);
      }
    };
    ajax.open("POST", "http://localhost:8080/zauzeca", true);
    ajax.setRequestHeader("Content-Type", "application/json");
    ajax.send(JSON.stringify(zauzece));
  }

  function upisiRezervacijuImpl(rezervacija, fnCallbackOK, fnCallbackError) {
    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function() {
      if (ajax.readyState == 4 && ajax.status == 200) {
        var jsonResult = JSON.parse(ajax.responseText);
        fnCallbackOK(jsonResult.zauzeca);
        fnCallbackError(jsonResult.error);
      }
    };
    ajax.open("POST", "http://localhost:8080/rezervacija", true);
    ajax.setRequestHeader("Content-Type", "application/json");
    ajax.send(JSON.stringify(rezervacija));
  }

  function ucitajZauzecaImpl(fnCallback) {
    var ajax = new XMLHttpRequest();
    ajax.open("GET", "http://localhost:8080/zauzeca", true);
    ajax.onreadystatechange = function() {
      if (ajax.readyState == 4 && ajax.status == "200")
        fnCallback(ajax.responseText);
    };
    ajax.send();
  }

  function ucitajSlikeImpl(fnCallback) {
    var ajax = new XMLHttpRequest();
    ajax.open("GET", "http://localhost:8080/img", true);
    ajax.onreadystatechange = function() {
      if (ajax.readyState == 4 && ajax.status == 200) {
        var ucitaneSlike = JSON.parse(ajax.responseText);
        fnCallback(ucitaneSlike.length);
      }
    };
    ajax.send();
  }

  function ucitajSlikuImpl(sadrzaj, fnCallback) {
    var ajax = new XMLHttpRequest();
    ajax.open("GET", "http://localhost:8080/slika", true);
    ajax.responseType = "arraybuffer";
    ajax.onreadystatechange = function() {
      if (ajax.readyState == 4 && ajax.status == 200) {
        var arr = new Uint8Array(ajax.response);
        var raw = String.fromCharCode.apply(null, arr);
        var b64 = btoa(raw);
        var dataURL = "data:image/jpeg;base64," + b64;
        fnCallback(dataURL);
        var img = document.createElement("img");
        img.src = dataURL;
        sadrzaj.appendChild(img);
      }
    };
    ajax.send();
  }

  function ucitajOsobljeImpl(fnCallback) {
    var ajax = new XMLHttpRequest();
    ajax.open("GET", "http://localhost:8080/osoblje", true);
    ajax.onreadystatechange = function() {
      if (ajax.readyState == 4 && ajax.status == 200) {
        fnCallback(ajax.responseText);
      }
    };
    ajax.send();
  }

  function ucitajSaleImpl(fnCallback) {
    var ajax = new XMLHttpRequest();
    ajax.open("GET", "http://localhost:8080/sale", true);
    ajax.onreadystatechange = function() {
      if (ajax.readyState == 4 && ajax.status == 200) {
        fnCallback(ajax.responseText);
      }
    };
    ajax.send();
  }

  function ucitajRezervacijeImpl(fnCallback) {
    var ajax = new XMLHttpRequest();
    ajax.open("GET", "http://localhost:8080/sveRezervacije", true);
    ajax.onreadystatechange = function() {
      if (ajax.readyState == 4 && ajax.status == 200) {
        fnCallback(ajax.responseText);
      }
    };
    ajax.send();
  }

  return {
    upisiZauzece: upisiZauzeceImpl,
    ucitajZauzeca: ucitajZauzecaImpl,
    ucitajSlike: ucitajSlikeImpl,
    ucitajSliku: ucitajSlikuImpl,
    ucitajOsoblje: ucitajOsobljeImpl,
    ucitajSale: ucitajSaleImpl,
    ucitajRezervacije: ucitajRezervacijeImpl,
    upisiRezervaciju: upisiRezervacijuImpl
  };
})();
