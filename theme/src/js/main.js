import { ClickyMenus } from "./vendors/clicky-menus";
import A11yDialog from "a11y-dialog";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import Swiper, { Navigation } from "swiper";

/**
 * Sitenav et ClickyMenus
 */

const menus = document.querySelectorAll(".clicky-menu");
menus.forEach(menu => {
  let clickyMenu = new ClickyMenus(menu);
  clickyMenu.init();
});

/**
 * Gestion des modales avec a11y-dialog
 * ========================================
 *
 * Précisions sur l'animation ouverture/fermeture :
 * Le script s'appuie une règle css "display: none"
 * lorsque la fenêtre est fermée, ce qui ne permet pas d'animer
 * la fermeture de la fenêtre.
 * Un contournement est suggéré par les auteurs du script
 * (voir https://github.com/KittyGiraudel/a11y-dialog/issues/244)
 * mais cela nécessite de remplacer "display: none" par "visibility: hidden",
 * avec des incompatibilités (pointer-events) avec des navigateurs pas si anciens.
 * De là, on tente une voie intermédiaire :
 *  - les règles "de base" s'appuient toujours sur "display: none";
 *  - Si js est disponible pour le navigateur, la règle "visibility: hidden"
 *    est appliquée.
 *  - Au chargement du script, ajout de la class "is-closed", pour appliquer
 *    à nouveau un "display: none";
 *  - Un écouteur est ajouté pour surveiller la fin de l'animation sur
 *    l'élément "c-dialog_body" et modifier les classes pour permettre l'animation,
 *    puis rendre la modale invisible.
 */

/**
 * Modale Sitenav
 */

// Récupérer la modale contenant la navigation version mobile
const sitenavMobileId = "dialog-sitenav-mobile";
const sitenavMobileEl = document.getElementById(sitenavMobileId);

// Au chargement la fenêtre est explicitement rendue invisible (display: none)
sitenavMobileEl.classList.add("is-closed");

// Boutons d'ouverture et de fermeture de la modale
const dialogTriggers = document.querySelectorAll(".c-sitenav_trigger");

// Récupérer l'élément qui sera animé
const dialogContentBody = sitenavMobileEl.querySelector(".c-dialog_body");

// Init du script
const dialogSitenav = new A11yDialog(sitenavMobileEl);

// Lors de l'affichage de la navigation
dialogSitenav.on("show", (dialogEl, dialogEvent) => {
  dialogEl.classList.remove("is-closed");
  dialogEl.classList.add("is-visible");
  // Bloquer le scroll sur l'élément body
  disableBodyScroll(dialogContentBody);

  // Vérifier le scroll et le remettre à zéro éventuellement.
  if (dialogContentBody.scrollTop > 0) {
    dialogContentBody.scrollTop = 0;
  }

  // Animer les deux boutons en même temps, car ils sont affichés en superposition,
  // leur apparence doit être identique.
  dialogTriggers.forEach((trigger) => {
    trigger.classList.add("is-active");
  });
});

// Lors de la fermeture
dialogSitenav.on("hide", (dialogEl, dialogEvent) => {
  // Ajouter l'id de la modale qui sera récupéré dans la fonction modaleTransitions
  dialogContentBody.modalId = sitenavMobileId;
  dialogContentBody.addEventListener("transitionend", modaleTransitions);
  dialogEl.classList.add("is-closing");
  dialogEl.classList.remove("is-visible");

  dialogTriggers.forEach((trigger) => {
    trigger.classList.remove("is-active");
  });
});

/**
 * Modale Formulaire de recherche
 */
const dialogRechercheId = "dialog-recherche";
const dialogRechercheEl = document.getElementById(dialogRechercheId);
const dialogRecherche = new A11yDialog(dialogRechercheEl);
dialogRechercheEl.classList.add("is-closed");
// Elément qui sera animé
const dialogRechercheBody = dialogRechercheEl.querySelector(".c-dialog_content");

// Lors de l'ouverture
dialogRecherche.on("show", (dialogEl, dialogEvent) => {
  dialogEl.classList.remove("is-closed");
  dialogEl.classList.add("is-visible");
  disableBodyScroll(dialogRechercheBody);
});

// Lors de la fermeture
dialogRecherche.on("hide", (dialogEl, dialogEvent) => {
  // Ajouter l'id de la modale qui sera récupéré dans la fonction modaleTransitions
  dialogRechercheBody.modalId = dialogRechercheId;
  dialogRechercheBody.addEventListener("transitionend", modaleTransitions);
  dialogRechercheBody.classList.add("is-closing");
  dialogEl.classList.remove("is-visible");
});


function modaleTransitions(event) {
  // Identifier le parent principal (modale)
  let dialog = event.target.closest("#" + event.currentTarget.modalId);
  // Supprimer la classe qui permet l'animation
  dialog.classList.remove("is-closing");
  // Ajouter display: none
  dialog.classList.add("is-closed");
  // Supprimer l'écouteur
  event.target.removeEventListener("transitionend", modaleTransitions);
  // Rétablir le scroll sur l'élement body
  enableBodyScroll(event.target);
}

// Swiper
Swiper.use([Navigation]);
const sliderPortfolioArticle = document.querySelector(".p-article_portfolio");

if (sliderPortfolioArticle) {
  const swiperPortfolio = new Swiper(sliderPortfolioArticle);
}
