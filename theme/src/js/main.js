// import { ClickyMenus } from "./vendors/clicky-menus";
import A11yDialog from "a11y-dialog";
import {
  disableBodyScroll,
  enableBodyScroll
} from "body-scroll-lock";
import Swiper, { Navigation } from "swiper";


/**
 * Sitenav-mobile : modale avec a11y-dialog
 * ========================================
 *
 * Le script original s'appuie une règle css "display: none"
 * lorsque la fenêtre est fermée, ce qui ne permet pas d'animer
 * la fermeture de la fenêtre.
 * Un contournement est suggéré par l'autrice du script
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
  dialogContentBody.addEventListener("transitionend", sitenavMobileTransitions);
  dialogEl.classList.add("is-closing");
  dialogEl.classList.remove("is-visible");

  dialogTriggers.forEach((trigger) => {
    trigger.classList.remove("is-active");
  });
});


function sitenavMobileTransitions(event) {
  // Identifier le parent principal (modale)
  let dialog = event.target.closest("#" + sitenavMobileId);
  // Supprimer la classe qui permet l'animation
  dialog.classList.remove("is-closing");
  // Ajouter display: none
  dialog.classList.add("is-closed");
  // Supprimer l'écouteur
  event.target.removeEventListener("transitionend", sitenavMobileTransitions);
  // Rétablir le scroll sur l'élement body
  enableBodyScroll(event.target);
}

// Swiper
Swiper.use([Navigation]);
const sliderPortfolioArticle = document.querySelector(".p-article_portfolio");

if (sliderPortfolioArticle) {
  // const swiperPortfolio = new Swiper(sliderPortfolioArticle);
}

/*
const menus = document.querySelectorAll(".clicky-menu");

menus.forEach((menu) => {
  let clickyMenu = new ClickyMenus(menu);
  clickyMenu.init();
});
*/
