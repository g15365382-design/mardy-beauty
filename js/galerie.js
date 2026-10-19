/**
 * Mardy Beauty - galerie
 * Responsabilites :
 * - filtrage des visuels par categorie
 */
(function () {
  "use strict";

  var cartes = Array.prototype.slice.call(document.querySelectorAll(".carte-galerie"));
  var filtres = Array.prototype.slice.call(document.querySelectorAll(".filtre"));
  var compteur = document.getElementById("compteur-galerie");
  var messageVide = document.getElementById("galerie-vide");

  /* ------------------------------------------------------------------ */
  /* Filtres par categorie                                              */
  /* ------------------------------------------------------------------ */
  function carteEstVisible(carte) {
    return !carte.classList.contains("est-masquee");
  }

  function appliquerFiltre(categorie) {
    cartes.forEach(function (carte) {
      var correspond = categorie === "tout" || carte.dataset.categorie === categorie;
      carte.classList.toggle("est-masquee", !correspond);
    });

    var visibles = cartes.filter(carteEstVisible).length;

    if (compteur) {
      compteur.textContent =
        visibles + (visibles > 1 ? " visuels affiches" : " visuel affiche");
    }

    if (messageVide) {
      messageVide.hidden = visibles !== 0;
    }
  }

  function initialiserFiltres() {
    if (!filtres.length || !cartes.length) {
      return;
    }

    filtres.forEach(function (bouton) {
      bouton.addEventListener("click", function () {
        filtres.forEach(function (autre) {
          autre.setAttribute("aria-pressed", autre === bouton ? "true" : "false");
        });
        appliquerFiltre(bouton.dataset.filtre);
      });
    });

    appliquerFiltre("tout");
  }

  document.addEventListener("DOMContentLoaded", function () {
    initialiserFiltres();
  });
})();
