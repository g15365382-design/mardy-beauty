/**
 * Mardy Beauty - script principal
 * Responsabilites :
 * - menu mobile accessible (ouverture, fermeture, clavier)
 * - etat actif de la navigation selon la page courante
 * - en-tete collant avec ombre au defilement
 * - apparition des sections au defilement (IntersectionObserver)
 * - legere parallaxe du visuel d'accueil
 * - annee courante dans le pied de page
 */
(function () {
  "use strict";

  var PREFERE_MOUVEMENT_REDUIT = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ */
  /* Menu mobile                                                        */
  /* ------------------------------------------------------------------ */
  function initialiserMenu() {
    var burger = document.getElementById("burger");
    var nav = document.getElementById("nav-principale");

    if (!burger || !nav) {
      return;
    }

    function ouvrir() {
      nav.classList.add("est-ouvert");
      document.body.classList.add("est-verrouille");
      burger.setAttribute("aria-expanded", "true");
      burger.setAttribute("aria-label", "Fermer le menu");
    }

    function fermer() {
      nav.classList.remove("est-ouvert");
      document.body.classList.remove("est-verrouille");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Ouvrir le menu");
    }

    function basculer() {
      if (burger.getAttribute("aria-expanded") === "true") {
        fermer();
        burger.focus();
      } else {
        ouvrir();
      }
    }

    burger.addEventListener("click", basculer);

    nav.addEventListener("click", function (evenement) {
      if (evenement.target.closest("a")) {
        fermer();
      }
    });

    document.addEventListener("keydown", function (evenement) {
      if (evenement.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
        fermer();
        burger.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 768) {
        fermer();
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Etat actif de la navigation                                        */
  /* ------------------------------------------------------------------ */
  function marquerPageCourante() {
    var page = window.location.pathname.split("/").pop() || "index.html";
    var liens = document.querySelectorAll(".nav__lien");

    Array.prototype.forEach.call(liens, function (lien) {
      if (lien.getAttribute("href") === page) {
        lien.setAttribute("aria-current", "page");
      } else {
        lien.removeAttribute("aria-current");
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* En-tete collant                                                    */
  /* ------------------------------------------------------------------ */
  function initialiserEnteteCollant() {
    var entete = document.getElementById("entete");

    if (!entete) {
      return;
    }

    function actualiser() {
      if (window.scrollY > 12) {
        entete.classList.add("est-colle");
      } else {
        entete.classList.remove("est-colle");
      }
    }

    actualiser();
    window.addEventListener("scroll", actualiser, { passive: true });
  }

  /* ------------------------------------------------------------------ */
  /* Apparition au defilement                                           */
  /* ------------------------------------------------------------------ */
  function initialiserApparitions() {
    var elements = document.querySelectorAll("[data-reveal]");

    if (!elements.length) {
      return;
    }

    var mouvementReduit = PREFERE_MOUVEMENT_REDUIT || !("IntersectionObserver" in window);

    if (mouvementReduit) {
      Array.prototype.forEach.call(elements, function (element) {
        element.classList.add("reveal", "est-visible");
      });
      return;
    }

    var observateur = new IntersectionObserver(
      function (entrees) {
        entrees.forEach(function (entree) {
          if (entree.isIntersecting) {
            entree.target.classList.add("est-visible");
            observateur.unobserve(entree.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    Array.prototype.forEach.call(elements, function (element) {
      element.classList.add("reveal");
      observateur.observe(element);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Parallaxe du hero                                                  */
  /* ------------------------------------------------------------------ */
  function initialiserParallaxe() {
    var visuel = document.querySelector(".hero__visuel");

    if (!visuel || PREFERE_MOUVEMENT_REDUIT) {
      return;
    }

    var enAttente = false;

    function actualiser() {
      var position = visuel.getBoundingClientRect();
      var avancement = Math.min(Math.max((window.innerHeight - position.top) / window.innerHeight, 0), 1);
      visuel.style.setProperty("--parallaxe", (avancement * -18).toFixed(2) + "px");
      enAttente = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!enAttente) {
          enAttente = true;
          window.requestAnimationFrame(actualiser);
        }
      },
      { passive: true }
    );

    actualiser();
  }

  /* ------------------------------------------------------------------ */
  /* Formulaire de contact : validation, puis ouverture de WhatsApp     */
  /* ------------------------------------------------------------------ */
  var NUMERO_WHATSAPP = "22946543406";

  function initialiserFormulaireContact() {
    var formulaire = document.getElementById("formulaire-contact");

    if (!formulaire) {
      return;
    }

    var retourSucces = document.getElementById("retour-succes");
    var retourErreur = document.getElementById("retour-erreur");
    var motifTelephone = /^(\+?[0-9][0-9 .-]{7,}[0-9])?$/;
    var soumis = false;

    var regles = [
      {
        champ: "champ-nom",
        erreur: "erreur-nom",
        valider: function (valeur) {
          if (valeur.length < 2) {
            return "Indiquez votre nom et votre prénom, deux caractères minimum.";
          }
          return "";
        }
      },
      {
        champ: "champ-telephone",
        erreur: "erreur-telephone",
        valider: function (valeur) {
          if (valeur !== "" && !motifTelephone.test(valeur)) {
            return "Le numéro doit contenir au moins dix chiffres.";
          }
          return "";
        }
      },
      {
        champ: "champ-prestation",
        erreur: "erreur-prestation",
        valider: function (valeur) {
          return valeur === "" ? "Choisissez une prestation dans la liste." : "";
        }
      },
      {
        champ: "champ-message",
        erreur: "erreur-message",
        valider: function (valeur) {
          if (valeur.length < 10) {
            return "Votre message doit contenir au moins dix caractères.";
          }
          return "";
        }
      }
    ];

    function valeurDe(element) {
      return element.value.trim();
    }

    function validerRegle(regle) {
      var element = document.getElementById(regle.champ);

      if (!element) {
        return true;
      }

      var message = regle.valider(valeurDe(element), element);
      var conteneur = element.closest(".champ");
      var zoneErreur = regle.erreur ? document.getElementById(regle.erreur) : null;

      if (zoneErreur) {
        zoneErreur.textContent = message;
      }

      if (conteneur) {
        conteneur.classList.toggle("est-invalide", message !== "");
      }

      if (message) {
        element.setAttribute("aria-invalid", "true");
      } else {
        element.removeAttribute("aria-invalid");
      }

      return !message;
    }

    function validerFormulaire() {
      var premierInvalide = null;

      regles.forEach(function (regle) {
        if (!validerRegle(regle) && premierInvalide === null) {
          premierInvalide = document.getElementById(regle.champ);
        }
      });

      return premierInvalide;
    }

    regles.forEach(function (regle) {
      var element = document.getElementById(regle.champ);

      if (!element) {
        return;
      }

      var evenement = element.tagName === "SELECT" ? "change" : "input";

      element.addEventListener(evenement, function () {
        if (soumis) {
          validerRegle(regle);
        }
      });
    });

    function reinitialiserEtats() {
      regles.forEach(function (regle) {
        var element = document.getElementById(regle.champ);
        var zoneErreur = regle.erreur ? document.getElementById(regle.erreur) : null;

        if (zoneErreur) {
          zoneErreur.textContent = "";
        }

        if (element) {
          element.removeAttribute("aria-invalid");
          var conteneur = element.closest(".champ");
          if (conteneur) {
            conteneur.classList.remove("est-invalide");
          }
        }
      });
    }

    /* Le site n'a pas de serveur : le message est transmis a WhatsApp. */
    function composerMessage() {
      var nom = document.getElementById("champ-nom").value.trim();
      var telephone = document.getElementById("champ-telephone").value.trim();
      var prestation = document.getElementById("champ-prestation").value;
      var message = document.getElementById("champ-message").value.trim();
      var lignes = [
        "Bonjour mMardy Beauty, je m'appelle " + nom + ".",
        "Prestation souhaitée : " + prestation + "."
      ];

      if (telephone !== "") {
        lignes.push("Mon numéro : " + telephone + ".");
      }

      lignes.push("", message);

      return lignes.join("\n");
    }

    formulaire.addEventListener("submit", function (evenement) {
      evenement.preventDefault();
      soumis = true;

      if (retourSucces) {
        retourSucces.hidden = true;
      }

      var premierInvalide = validerFormulaire();

      if (premierInvalide) {
        if (retourErreur) {
          retourErreur.hidden = false;
        }
        premierInvalide.focus();
        return;
      }

      if (retourErreur) {
        retourErreur.hidden = true;
      }

      var lien =
        "https://wa.me/" + NUMERO_WHATSAPP + "?text=" + encodeURIComponent(composerMessage());

      formulaire.reset();
      reinitialiserEtats();
      soumis = false;

      window.open(lien, "_blank", "noopener");

      if (retourSucces) {
        retourSucces.hidden = false;
        retourSucces.focus();
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Annee courante                                                     */
  /* ------------------------------------------------------------------ */
  function inscrireAnnee() {
    var emplacements = document.querySelectorAll("[data-annee]");
    var annee = String(new Date().getFullYear());

    Array.prototype.forEach.call(emplacements, function (emplacement) {
      emplacement.textContent = annee;
    });
  }

  /* ------------------------------------------------------------------ */
  /* Initialisation                                                     */
  /* ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    initialiserMenu();
    marquerPageCourante();
    initialiserEnteteCollant();
    initialiserApparitions();
    initialiserParallaxe();
    initialiserFormulaireContact();
    inscrireAnnee();
  });
})();
