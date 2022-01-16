import { ClickyMenus } from "./vendors/clicky-menus";
import A11yDialog from "a11y-dialog";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import Swiper, { Navigation } from "swiper";
import { PhotoSwipeInit } from "./vendors/photoswipe-init";

const pourmagnelli = {
  sitenavMobileTriggers: [],
  init: () => {
    pourmagnelli.sitenavMobileTriggers = document.querySelectorAll(
      "button.c-sitenav_trigger:not(.-recherche)"
    );
    pourmagnelli.makeClickyMenu();
    pourmagnelli.makeDialogSiteNavMobile();
    pourmagnelli.makeDialogRechercheDesktop();
    pourmagnelli.backToTopObserver();
    pourmagnelli.makePortfolio();
  },

  /**
   * Lien retour en haut de page
   */
  backToTopObserver: () => {
    const topOfPageLink = document.querySelector(".c-top-of-page");
    const topOfPageTarget = document.querySelector(
      "#top-of-page-observer-target"
    );
    const topOfPageObserver = new IntersectionObserver((observer) => {
      if (observer[0].boundingClientRect.y < 0) {
        topOfPageLink.dataset.visible = true;
      } else {
        topOfPageLink.dataset.visible = false;
      }
    }).observe(topOfPageTarget);
  },

  /**
   * Navigation principale.
   *
   * ClickyMenu : https://github.com/mrwweb/clicky-menus
   *
   * Les menus déroulants sur 1 niveau s'ouvrent :
   * - par défaut, avec un hover,
   * - sinon par un click.
   *
   * Le script ajoute une accessibilité aux boutons.
   *
   */
  makeClickyMenu: () => {
    const menus = document.querySelectorAll(".clicky-menu");
    menus.forEach((menu) => {
      let clickyMenu = new ClickyMenus(menu);
      clickyMenu.init();
    });
  },



  /**
   * Navigation principale (version mobile) affichée dans une modale
   */
  makeDialogSiteNavMobile: () => {
    /**
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

    // Récupérer la modale contenant la navigation version mobile
    const sitenavMobileId = "dialog-sitenav-mobile";
    const sitenavMobileEl = document.getElementById(sitenavMobileId);

    // Au chargement la fenêtre est explicitement rendue invisible (display: none)
    sitenavMobileEl.classList.add("is-closed");

    // Boutons d'ouverture et de fermeture de la modale
    const dialogTriggers = pourmagnelli.sitenavMobileTriggers;

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

      // Le menu contient l'élement "Association", dont les liens ne sont que des ancres
      // vers un seul et même article. Le menu version mobile est ouvert à l'adresse
      // de l'article et que l'on clique sur une ancre, le menu ne se referme pas
      // -- aucun rechargement de la page, puisqu'elle est déjà en cours de consultation.
      // Dans ce contexte, ajout d'un écouteur sur la liste des ancres afin de forcer
      // la fermture de la modale.
      let sommaireLinksList = dialogContentBody.querySelector(".js-sommaire-hash").parentNode;
      sommaireLinksList.addEventListener("click", handleSommaireClick);
    });

    // Lors de la fermeture
    dialogSitenav.on("hide", (dialogEl, dialogEvent) => {
      // Ajouter l'id de la modale qui sera récupéré dans la fonction modaleTransitions
      dialogContentBody.modalId = sitenavMobileId;
      dialogContentBody.addEventListener("transitionend", modaleTransitionEnd);
      dialogEl.classList.add("is-closing");
      dialogEl.classList.remove("is-visible");

      dialogTriggers.forEach((trigger) => {
        trigger.classList.remove("is-active");
      });
    });
  },

  /**
   * Formulaire de recherche affiché dans une modale
   */
  makeDialogRechercheDesktop: () => {
    const dialogRechercheId = "dialog-recherche";
    const dialogRechercheEl = document.getElementById(dialogRechercheId);
    const dialogRecherche = new A11yDialog(dialogRechercheEl);
    dialogRechercheEl.classList.add("is-closed");
    // Elément qui sera animé
    const dialogRechercheBody =
      dialogRechercheEl.querySelector(".c-dialog_content");

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
      dialogRechercheBody.addEventListener(
        "transitionend",
        modaleTransitionEnd
      );
      dialogRechercheBody.classList.add("is-closing");
      dialogEl.classList.remove("is-visible");
    });
  },

  /**
   * Activer le portfolio.
   * Nécessite Swiperjs et PhotoSwipe.
   *
   * Le js de PhotoSwipe est fourni par le plugin "ps".
   * Mais l'initialisation est effectuée ici car l'instance de Swiper
   * est également nécessaire.
   */
  makePortfolio: () => {
    /**
     * Swiperjs
     */
    const sliderPortfolioArticle = document.querySelector(
      ".p-article_portfolio"
    );

    // PhotoSwipe appelle l'instance de Swiper.
    let swiperPortfolio = null;

    if (sliderPortfolioArticle) {
      swiperPortfolio = new Swiper(sliderPortfolioArticle, {
        modules: [Navigation],
        slidesPerView: 1,
        loop: setSwiperLoop(sliderPortfolioArticle, 1),
        watchOverflow: true,
        breakpoints: {
          640: {
            slidesPerView: "auto",
            loop: setSwiperLoop(sliderPortfolioArticle, 2),
          },
        },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
      });
    }

    /**
     * PhotoSwipe
     */

    const psData = {
      conteneur: ".js-photoswipe",
      selecteur: "a[data-pswp-index]",
    };

    psData.galeries = document.querySelectorAll(psData.conteneur);
    psData.images = document.querySelectorAll(psData.selecteur);

    if (psData.images.length > 0) {
      PhotoSwipeInit(psData, swiperPortfolio);
    }
  },
};

function setSwiperLoop(wrapper, seuil) {
  let slides = wrapper.querySelectorAll(".swiper-slide");
  return slides.length > seuil ? true : false;
}

function modaleTransitionEnd(event) {
  // Identifier le parent principal (modale)
  let dialog = event.target.closest("#" + event.currentTarget.modalId);
  // Supprimer la classe qui permet l'animation
  dialog.classList.remove("is-closing");
  // Ajouter display: none
  dialog.classList.add("is-closed");
  // Supprimer l'écouteur
  event.target.removeEventListener("transitionend", modaleTransitionEnd);
  // Rétablir le scroll sur l'élement body
  enableBodyScroll(event.target);
}

function handleSommaireClick(event) {
  let eTarget = event.target || event.srcElement;
  // Récupérer le parent ul du clic
  let targetParent = eTarget.closest("ul");
  // Simuler un clic de fermeture sur la modale.
  pourmagnelli.sitenavMobileTriggers.forEach((trigger) => {
    trigger.click();
  });
  // Retirer l'écouteur sur le parent
  targetParent.removeEventListener("click", handleSommaireClick);
}

document.addEventListener("DOMContentLoaded", function () {
  pourmagnelli.init();
});
