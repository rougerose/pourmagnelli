import { ClickyMenus } from "./vendors/clicky-menus";
import A11yDialog from "a11y-dialog";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import Swiper, { Navigation } from "swiper";

const pourmagnelli = {
  init: () => {
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
     *
     * Le script est initialisé ici (et non par le plugin ps lui-même),
     * car l'instance de swiper est nécessaire pour permettre la synchro
     * entre le changement d'image dans la box de photoswipe
     * et le carousel de swiper.
     */
    var initPhotoSwipeFromDOM = function (gallerySelector, swiperInstance) {
      // parse slide data (url, title, size ...) from DOM elements
      // (children of gallerySelector)
      var parseThumbnailElements = function (el) {
        var thumbElements = el.querySelectorAll("figure"), // el.childNodes,
          numNodes = thumbElements.length,
          items = [],
          figureEl,
          linkEl,
          linkL,
          linkM,
          linkS,
          sizeXL,
          sizeL,
          sizeM,
          sizeS,
          titleData,
          descData,
          authorData,
          item;

        for (var i = 0; i < numNodes; i++) {
          figureEl = thumbElements[i]; // <figure> element

          // include only element nodes
          if (figureEl.nodeType !== 1) {
            continue;
          }

          linkEl = figureEl.children[0]; // <a> element

          linkL = linkEl.getAttribute("data-l");
          linkM = linkEl.getAttribute("data-m");
          linkS = linkEl.getAttribute("data-s");

          sizeXL = linkEl.getAttribute("data-size").split("x");
          sizeL = linkEl.getAttribute("data-l-size").split("x");
          sizeM = linkEl.getAttribute("data-m-size").split("x");
          sizeS = linkEl.getAttribute("data-s-size").split("x");

          titleData = linkEl.getAttribute("data-title") || false;
          descData = linkEl.getAttribute("data-desc") || false;
          authorData = linkEl.getAttribute("data-author") || false;

          // item.title doit être présent si l'on souhaite afficher
          // d'autres infos en caption.
          if (!titleData) {
            if (descData || authorData) {
              titleData = " ";
            }
          }

          // create slide object
          item = {
            title: titleData,
            desc: descData,
            author: authorData,
            xl: {
              src: linkEl.getAttribute("href"),
              w: parseInt(sizeXL[0], 10),
              h: parseInt(sizeXL[1], 10),
            },
            l: {
              src: linkL,
              w: parseInt(sizeL[0], 10),
              h: parseInt(sizeL[1], 10),
            },
            m: {
              src: linkM,
              w: parseInt(sizeM[0], 10),
              h: parseInt(sizeM[1], 10),
            },
            s: {
              src: linkS,
              w: parseInt(sizeS[0], 10),
              h: parseInt(sizeS[1], 10),
            },
          };

          // if(figureEl.children.length > 1) {
          //     // <figcaption> content
          //     item.title = figureEl.children[1].innerHTML;
          // }

          if (linkEl.children.length > 0) {
            // <img> thumbnail element, retrieving thumbnail url
            item.msrc = linkEl.children[0].getAttribute("src");
          }

          item.el = figureEl; // save link to element for getThumbBoundsFn
          items.push(item);
        }

        return items;
      };

      // find nearest parent element
      var closest = function closest(el, fn) {
        return el && (fn(el) ? el : closest(el.parentNode, fn));
      };

      // triggers when user clicks on thumbnail
      var onThumbnailsClick = function (e) {
        e = e || window.event;
        e.preventDefault ? e.preventDefault() : (e.returnValue = false);

        var eTarget = e.target || e.srcElement;

        // find root element of slide
        var clickedListItem = closest(eTarget, function (el) {
          return el.tagName && el.tagName.toUpperCase() === "FIGURE";
        });

        if (!clickedListItem) {
          return;
        }

        // find index of clicked item by looping through all child nodes
        // alternatively, you may define index via data- attribute
        // var clickedGallery = clickedListItem.parentNode,
        //   childNodes = clickedListItem.parentNode.childNodes,
        //   numChildNodes = childNodes.length,
        //   nodeIndex = 0,
        //   index;

        /**
         * Data- alternative
         *
         * La structure html des modèles images de Spip est différente
         * de celle attendue par le script original de Photoswipe.
         * Donc on recherche explicitement
         * - le parent avec le sélecteur [data-pswp-uid]
         * - les enfants avec le selecteur <figure>
         *
         */
        var clickedGallery = clickedListItem.closest("[data-pswp-uid]"),
          childNodes = clickedGallery.querySelectorAll("figure"),
          numChildNodes = childNodes.length,
          nodeIndex = 0,
          index;

        for (var i = 0; i < numChildNodes; i++) {
          if (childNodes[i].nodeType !== 1) {
            continue;
          }

          if (childNodes[i] === clickedListItem) {
            index = nodeIndex;
            break;
          }
          nodeIndex++;
        }

        if (index >= 0) {
          // open PhotoSwipe if valid index found
          openPhotoSwipe(index, clickedGallery);
        }
        return false;
      };

      // parse picture index and gallery index from URL (#&pid=1&gid=2)
      var photoswipeParseHash = function () {
        var hash = window.location.hash.substring(1),
          params = {};

        if (hash.length < 5) {
          return params;
        }

        var vars = hash.split("&");
        for (var i = 0; i < vars.length; i++) {
          if (!vars[i]) {
            continue;
          }
          var pair = vars[i].split("=");
          if (pair.length < 2) {
            continue;
          }
          params[pair[0]] = pair[1];
        }

        if (params.gid) {
          params.gid = parseInt(params.gid, 10);
        }

        return params;
      };

      var openPhotoSwipe = function (
        index,
        galleryElement,
        disableAnimation,
        fromURL
      ) {
        var pswpElement = document.querySelectorAll(".pswp")[0],
          gallery,
          options,
          items;

        items = parseThumbnailElements(galleryElement);

        // define options (if needed)
        options = {
          // define gallery index (for URL)
          galleryUID: galleryElement.getAttribute("data-pswp-uid"),

          getThumbBoundsFn: function (index) {
            // See Options -> getThumbBoundsFn section of documentation for more info
            var thumbnail = items[index].el.getElementsByTagName("img")[0], // find thumbnail
              pageYScroll =
                window.pageYOffset || document.documentElement.scrollTop,
              rect = thumbnail.getBoundingClientRect();

            return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
          },

          addCaptionHTMLFn: function (item, captionEl, isFake) {
            // item      - slide object
            // captionEl - caption DOM element
            // isFake    - true when content is added to fake caption container
            //             (used to get size of next or previous caption)

            if (!item.title && !item.desc && !item.author) {
              captionEl.children[0].innerHTML = "";
              return false;
            }
            var captionTitle = item.title ? "<h4>" + item.title + "</h4>" : "",
              captionDesc = item.desc ? item.desc + "<br/>" : "",
              captionAuthor = item.author
                ? "<small>" + item.author + "</small>"
                : "";
            captionEl.children[0].innerHTML =
              captionTitle + captionDesc + captionAuthor;
            return true;
          },

          shareEl: false, // pas de partage
          counterEl: false, // pas de compteur
        };

        // PhotoSwipe opened from URL
        if (fromURL) {
          if (options.galleryPIDs) {
            // parse real index when custom PIDs are used
            // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
            for (var j = 0; j < items.length; j++) {
              if (items[j].pid == index) {
                options.index = j;
                break;
              }
            }
          } else {
            // in URL indexes start from 1
            options.index = parseInt(index, 10) - 1;
          }
        } else {
          options.index = parseInt(index, 10);
        }

        // exit if index not found
        if (isNaN(options.index)) {
          return;
        }

        if (disableAnimation) {
          options.showAnimationDuration = 0;
        }

        // Pass data to PhotoSwipe and initialize it
        gallery = new PhotoSwipe(
          pswpElement,
          PhotoSwipeUI_Default,
          items,
          options
        );

        // responsive images
        // create variable that will store real size of viewport
        var realViewportWidth,
          useXLargeImages = false,
          useLargeImages = false,
          useMediumImages = false,
          useSmallImages = false,
          firstResize = true,
          imageSrcWillChange;

        //realViewportWidth = gallery.viewportSize.x * window.devicePixelRatio;

        // beforeResize event fires each time size of gallery viewport updates
        gallery.listen("beforeResize", function () {
          // gallery.viewportSize.x - width of PhotoSwipe viewport
          // gallery.viewportSize.y - height of PhotoSwipe viewport
          // window.devicePixelRatio - ratio between physical pixels and device independent pixels (Number)
          //                          1 (regular display), 2 (@2x, retina) ...

          // calculate real pixels when size changes
          realViewportWidth = gallery.viewportSize.x * window.devicePixelRatio;

          if (realViewportWidth >= 1280) {
            useXLargeImages = true;
            imageSrcWillChange = true;
          } else if (realViewportWidth >= 1024) {
            useLargeImages = true;
            imageSrcWillChange = true;
          } else if (realViewportWidth >= 900) {
            useMediumImages = true;
            imageSrcWillChange = true;
          } else if (realViewportWidth < 900) {
            useSmallImages = true;
            imageSrcWillChange = true;
          }

          // Code below is needed if you want image to switch dynamically on window.resize

          // Find out if current images need to be changed
          // if(useLargeImages && realViewportWidth < 1000) {
          //     useLargeImages = false;
          //     imageSrcWillChange = true;
          // } else if(!useLargeImages && realViewportWidth >= 1000) {
          //     useLargeImages = true;
          //     imageSrcWillChange = true;
          // }

          // Invalidate items only when source is changed and when it's not the first update
          if (imageSrcWillChange && !firstResize) {
            // invalidateCurrItems sets a flag on slides that are in DOM,
            // which will force update of content (image) on window.resize.
            gallery.invalidateCurrItems();
          }

          if (firstResize) {
            firstResize = false;
          }

          imageSrcWillChange = false;
        });

        // gettingData event fires each time PhotoSwipe retrieves image source & size
        gallery.listen("gettingData", function (index, item) {
          // Set image source & size based on real viewport width
          if (useXLargeImages) {
            item.src = item.xl.src;
            item.w = item.xl.w;
            item.h = item.xl.h;
          } else if (useLargeImages) {
            item.src = item.l.src;
            item.w = item.l.w;
            item.h = item.l.h;
          } else if (useMediumImages) {
            item.src = item.m.src;
            item.w = item.m.w;
            item.h = item.m.h;
          } else if (useSmallImages) {
            item.src = item.s.src;
            item.w = item.s.w;
            item.h = item.s.h;
          }

          // It doesn't really matter what will you do here,
          // as long as item.src, item.w and item.h have valid values.
          //
          // Just avoid http requests in this listener, as it fires quite often
        });

        /**
         * Si l'image provient d'un portfolio avec Swiper
         * il faut synchroniser la position du carousel avec
         * la dernière image affichée dans la box de PhotoSwipe.
         * Reférence <https://codepen.io/ezra_siton/pen/XNpJaX>
         */
        if (swiperInstance) {
          gallery.listen("unbindEvents", function () {
            let currentIndex = gallery.getCurrentIndex();
            // Mettre à jour la position du carousel
            swiperInstance.slideTo(currentIndex, 0, false);
          });
        }

        gallery.init();
      };

      // loop through all gallery elements and bind events
      var galleryElements = document.querySelectorAll(gallerySelector);

      for (var i = 0, l = galleryElements.length; i < l; i++) {
        galleryElements[i].setAttribute("data-pswp-uid", i + 1);
        galleryElements[i].onclick = onThumbnailsClick;
      }

      // Parse URL and open gallery if it contains #&pid=3&gid=1
      var hashData = photoswipeParseHash();
      if (hashData.pid && hashData.gid) {
        openPhotoSwipe(
          hashData.pid,
          galleryElements[hashData.gid - 1],
          true,
          true
        );
      }
    };

    initPhotoSwipeFromDOM(".js-photoswipe", swiperPortfolio);
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

document.addEventListener("DOMContentLoaded", function () {
  pourmagnelli.init();
});
