/**
 * Script d'initialisation de Photoswipe.
 *
 * Le script est un mixte entre le modèle de base fourni par l'auteur,
 * et celui utilisé avec le plugin Spip PhotoSwipe.
 * Ce dernier permet de constituer une sorte de galerie virtuelle
 * des images en logo et insérées dans le texte. De plus, le listener
 * étant posé sur les images (et non le document entier comme c'est le cas
 * dans le script original), cela permet d'ajouter les images insérées
 * dans le texte dans une galerie et de ne pas perturber le fonctionnement
 * des liens du texte.
 * Du script original, on garde la possibilité d'appeler une image par son
 * url.
 */
export const PhotoSwipeInit = (psData, swiperInstance) => {

  const onImageClick = (event) => {
    event.preventDefault();

    let eTarget = event.target || event.srcElement,
      linkTarget = eTarget.closest("a[data-pswp-index]"),
      galerie = linkTarget.closest(psData.conteneur),
      indexGalerie;

    if (galerie) {
      indexGalerie = galerie.dataset.pswpUid;
    } else {
      indexGalerie = 1; // galerie virtuelle
    }

    let images = getCollectionFromImage(linkTarget, indexGalerie, psData);

    openPhotoSwipe(
      images.indexImage,
      images.images,
      indexGalerie
    );
  };

  const getCollectionFromImage = (imageTarget, indexGalerie, psData) => {
    let galerie, images, indexCurentImage,
      identifyImageTarget = false;

    if (typeof imageTarget === "string") {
      imageTarget = parseInt(imageTarget, 10);
      indexGalerie = parseInt(indexGalerie, 10);
      identifyImageTarget = true;
    }

    if (indexGalerie > 1) {
      psData.galeries.forEach((item) => {
        if (item.dataset.pswpUid == indexGalerie) {
          galerie = item;
        }
      });
      images = galerie.querySelectorAll(psData.selecteur);
    } else {
      // Sinon, constituer une collection à afficher.
      if (psData.galeries.length == 0) {
        // Pas de galerie déjà constituée, toutes les images de la page sont candidates.
        images = Array.from(psData.images);
      } else {
        // Si des galeries existent, la collection d'images à afficher
        // est réalisée en comparant la liste des images complètes à la liste
        // des images dans les galeries déjà constituées.
        let imagesGaleries = [];
        // Récupérer la liste des images dans les galeries
        psData.galeries.forEach((item) => {
          let imgs = item.querySelectorAll(psData.selecteur);
          // Transformer la Nodelist en array
          imagesGaleries.push(Array.from(imgs));
        });

        // imagesGaleries est un tableau associatif
        imagesGaleries.forEach((galerie) => {
          // Ne garder du groupe que les images qui ne sont pas dans une galerie
          images = Array.from(psData.images).filter(
            (img) => !galerie.includes(img)
          );
        });
      }
    }

    // L'image de référence est désignée par un index et non par l'objet lui-même
    if (identifyImageTarget) {
      indexCurentImage = imageTarget;
      imageTarget = images[indexCurentImage];
    } else {
      // C'est un objet, mais on ignore sa position dans la collection
      images.forEach((image, i) => {
        if (image === imageTarget) {
          indexCurentImage = i;
        }
      });
    }
    return { images: images, indexImage: indexCurentImage };
  };

  const openPhotoSwipe = (
    indexCurentImage,
    imagesArray,
    indexGalerie,
    disableAnimation,
    fromURL
  ) => {
    let pswpModale = document.querySelectorAll(".pswp")[0],
      galerie,
      options,
      images;

    images = parseImages(imagesArray);

    options = {
      galleryUID: indexGalerie,
      getThumbBoundsFn: function (index) {
        // See Options -> getThumbBoundsFn section of documentation for more info
        let thumbnail =
            images[index].el.getElementsByTagName("img")[0], // find thumbnail
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
        for (var j = 0; j < images.length; j++) {
          if (images[j].pid == indexCurentImage) {
            options.index = j;
            break;
          }
        }
      } else {
        // in URL indexes start from 1
        options.index = parseInt(indexCurentImage, 10) - 1;
      }
    } else {
      options.index = parseInt(indexCurentImage, 10);
    }

    // exit if index not found
    if (isNaN(options.index)) {
      return;
    }

    if (disableAnimation) {
      options.showAnimationDuration = 0;
    }

    // Pass data to PhotoSwipe and initialize it
    galerie = new PhotoSwipe(
      pswpModale,
      PhotoSwipeUI_Default,
      images,
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
    galerie.listen("beforeResize", function () {
      // gallery.viewportSize.x - width of PhotoSwipe viewport
      // gallery.viewportSize.y - height of PhotoSwipe viewport
      // window.devicePixelRatio - ratio between physical pixels and device independent pixels (Number)
      //                          1 (regular display), 2 (@2x, retina) ...

      // calculate real pixels when size changes
      realViewportWidth = galerie.viewportSize.x * window.devicePixelRatio;

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
        galerie.invalidateCurrItems();
      }

      if (firstResize) {
        firstResize = false;
      }

      imageSrcWillChange = false;
    });

    // gettingData event fires each time PhotoSwipe retrieves image source & size
    galerie.listen("gettingData", function (index, item) {
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
      galerie.listen("unbindEvents", function () {
        let currentIndex = galerie.getCurrentIndex();
        // Mettre à jour la position du carousel
        swiperInstance.slideTo(currentIndex, 0, false);
      });
    }

    galerie.init();
  };

  const parseImages = (imagesArray) => {
    let images = [],
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

    imagesArray.forEach((image) => {
      linkEl = image; // On récupére en fait le lien qui contient l'image.
      figureEl = image.parentNode;
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

      if (!titleData) {
        if (descData || authorData) {
          titleData = " ";
        }
      }

      // create slide object
      image = {
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
      if (linkEl.children.length > 0) {
        // <img> thumbnail element, retrieving thumbnail url
        image.msrc = linkEl.children[0].getAttribute("src");
      }

      image.el = figureEl; // save link to element for getThumbBoundsFn
      images.push(image);
    });
    return images;
  };

  // parse picture index and gallery index from URL (#&pid=1&gid=2)
  const photoswipeParseHash = () => {
    let hash = window.location.hash.substring(1),
      params = {};

    if (hash.length < 5) {
      return params;
    }

    let vars = hash.split("&");
    for (let i = 0; i < vars.length; i++) {
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

  // Initialisation
  if (psData.galeries.length > 0) {
    psData.galeries.forEach((galerie, index) => {
      // L'index 1 est réservé pour une galerie "virtuelle" des images
      // (logo et images insérées dans le texte) qui ne sont pas
      // dans une galerie définie dans le squelette.
      galerie.setAttribute("data-pswp-uid", index + 2);
    });
  }

  if (psData.images.length > 0) {
    psData.images.forEach((image) => {
      image.addEventListener("click", onImageClick);
    });
  }

  //Parse URL and open gallery if it contains #&pid=3&gid=1
  let hashData = photoswipeParseHash();
  if (hashData.pid && hashData.gid) {
    let images = getCollectionFromImage(hashData.pid, hashData.gid, psData);
    openPhotoSwipe(hashData.pid, images.images, hashData.gid, true, true);
  }
};
