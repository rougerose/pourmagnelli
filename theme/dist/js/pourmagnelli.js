(function () {
  'use strict';

  /**
   * Object for creating click-triggered navigation submenus
   * https://github.com/mrwweb/clicky-menus
   *
   * Thanks for the inspiration:
   * 		- https://www.lottejackson.com/learning/a-reusable-javascript-toggle-pattern
   * 		- https://codepen.io/lottejackson/pen/yObQRM
   */

  const ClickyMenus = function (menu) {
    // DOM element(s)
    let container = menu.parentElement,
      currentMenuItem,
      i,
      len;

    this.init = function () {
      menuSetup();
      document.addEventListener("click", closeOpenMenu);
    };

    /*===================================================
    =            Menu Open / Close Functions            =
    ===================================================*/
    function toggleOnMenuClick(e) {
      const button = e.currentTarget;

      // close open menu if there is one
      if (currentMenuItem && button !== currentMenuItem) {
        toggleSubmenu(currentMenuItem);
      }

      toggleSubmenu(button);
    }

    function toggleSubmenu(button) {
      const submenu = document.getElementById(
        button.getAttribute("aria-controls")
      );

      if ("true" === button.getAttribute("aria-expanded")) {
        button.setAttribute("aria-expanded", false);
        submenu.setAttribute("aria-hidden", true);
        currentMenuItem = false;
      } else {
        button.setAttribute("aria-expanded", true);
        submenu.setAttribute("aria-hidden", false);
        preventOffScreenSubmenu(submenu);
        currentMenuItem = button;
      }
    }

    function preventOffScreenSubmenu(submenu) {
      const screenWidth =
          window.innerWidth ||
          document.documentElement.clientWidth ||
          document.body.clientWidth,
        parent = submenu.offsetParent,
        menuLeftEdge = parent.getBoundingClientRect().left,
        menuRightEdge = menuLeftEdge + submenu.offsetWidth;

      if (menuRightEdge + 32 > screenWidth) {
        // adding 32 so it's not too close
        submenu.classList.add("sub-menu--right");
      }
    }

    function closeOnEscKey(e) {
      if (27 === e.keyCode) {
        // we're in a submenu item
        if (null !== e.target.closest('ul[aria-hidden="false"]')) {
          currentMenuItem.focus();
          toggleSubmenu(currentMenuItem);

          // we're on a parent item
        } else if ("true" === e.target.getAttribute("aria-expanded")) {
          toggleSubmenu(currentMenuItem);
        }
      }
    }

    function closeOpenMenu(e) {
      if (currentMenuItem && !e.target.closest("#" + container.id)) {
        toggleSubmenu(currentMenuItem);
      }
    }

    /*===========================================================
    =            Modify Menu Markup & Bind Listeners            =
    =============================================================*/
    function menuSetup() {
      menu.classList.remove("no-js");

      menu.querySelectorAll("ul").forEach((submenu) => {
        const menuItem = submenu.parentElement;

        if ("undefined" !== typeof submenu) {
          let button = convertLinkToButton(menuItem);

          setUpAria(submenu, button);

          // bind event listener to button
          button.addEventListener("click", toggleOnMenuClick);
          menu.addEventListener("keyup", closeOnEscKey);
        }
      });
    }

    /**
     * Why do this? See https://justmarkup.com/articles/2019-01-21-the-link-to-button-enhancement/
     */
    function convertLinkToButton(menuItem) {
      const link = menuItem.getElementsByTagName("a")[0],
        linkHTML = link.innerHTML,
        linkAtts = link.attributes,
        button = document.createElement("button");

      if (null !== link) {
        // copy button attributes and content from link
        button.innerHTML = linkHTML.trim();
        for (i = 0, len = linkAtts.length; i < len; i++) {
          let attr = linkAtts[i];
          if ("href" !== attr.name) {
            button.setAttribute(attr.name, attr.value);
          }
        }

        menuItem.replaceChild(button, link);
      }

      return button;
    }

    function setUpAria(submenu, button) {
      const submenuId = submenu.getAttribute("id");

      let id;
      if (null === submenuId) {
        id =
          button.textContent.trim().replace(/\s+/g, "-").toLowerCase() +
          "-submenu";
      } else {
        id = menuItemId + "-submenu";
      }

      // set button ARIA
      button.setAttribute("aria-controls", id);
      button.setAttribute("aria-expanded", false);

      // set submenu ARIA
      submenu.setAttribute("id", id);
      submenu.setAttribute("aria-hidden", true);
    }
  };

  var focusableSelectors = [
    'a[href]:not([tabindex^="-"])',
    'area[href]:not([tabindex^="-"])',
    'input:not([type="hidden"]):not([type="radio"]):not([disabled]):not([tabindex^="-"])',
    'input[type="radio"]:not([disabled]):not([tabindex^="-"])',
    'select:not([disabled]):not([tabindex^="-"])',
    'textarea:not([disabled]):not([tabindex^="-"])',
    'button:not([disabled]):not([tabindex^="-"])',
    'iframe:not([tabindex^="-"])',
    'audio[controls]:not([tabindex^="-"])',
    'video[controls]:not([tabindex^="-"])',
    '[contenteditable]:not([tabindex^="-"])',
    '[tabindex]:not([tabindex^="-"])',
  ];

  var TAB_KEY = 9;
  var ESCAPE_KEY = 27;

  /**
   * Define the constructor to instantiate a dialog
   *
   * @constructor
   * @param {Element} element
   */
  function A11yDialog(element) {
    // Prebind the functions that will be bound in addEventListener and
    // removeEventListener to avoid losing references
    this._show = this.show.bind(this);
    this._hide = this.hide.bind(this);
    this._maintainFocus = this._maintainFocus.bind(this);
    this._bindKeypress = this._bindKeypress.bind(this);

    this.$el = element;
    this.shown = false;
    this._id = this.$el.getAttribute('data-a11y-dialog') || this.$el.id;
    this._previouslyFocused = null;
    this._listeners = {};

    // Initialise everything needed for the dialog to work properly
    this.create();
  }

  /**
   * Set up everything necessary for the dialog to be functioning
   *
   * @param {(NodeList | Element | string)} targets
   * @return {this}
   */
  A11yDialog.prototype.create = function () {
    this.$el.setAttribute('aria-hidden', true);
    this.$el.setAttribute('aria-modal', true);
    this.$el.setAttribute('tabindex', -1);

    if (!this.$el.hasAttribute('role')) {
      this.$el.setAttribute('role', 'dialog');
    }

    // Keep a collection of dialog openers, each of which will be bound a click
    // event listener to open the dialog
    this._openers = $$('[data-a11y-dialog-show="' + this._id + '"]');
    this._openers.forEach(
      function (opener) {
        opener.addEventListener('click', this._show);
      }.bind(this)
    );

    // Keep a collection of dialog closers, each of which will be bound a click
    // event listener to close the dialog
    this._closers = $$('[data-a11y-dialog-hide]', this.$el).concat(
      $$('[data-a11y-dialog-hide="' + this._id + '"]')
    );
    this._closers.forEach(
      function (closer) {
        closer.addEventListener('click', this._hide);
      }.bind(this)
    );

    // Execute all callbacks registered for the `create` event
    this._fire('create');

    return this
  };

  /**
   * Show the dialog element, disable all the targets (siblings), trap the
   * current focus within it, listen for some specific key presses and fire all
   * registered callbacks for `show` event
   *
   * @param {Event} event
   * @return {this}
   */
  A11yDialog.prototype.show = function (event) {
    // If the dialog is already open, abort
    if (this.shown) {
      return this
    }

    // Keep a reference to the currently focused element to be able to restore
    // it later
    this._previouslyFocused = document.activeElement;
    this.$el.removeAttribute('aria-hidden');
    this.shown = true;

    // Set the focus to the dialog element
    moveFocusToDialog(this.$el);

    // Bind a focus event listener to the body element to make sure the focus
    // stays trapped inside the dialog while open, and start listening for some
    // specific key presses (TAB and ESC)
    document.body.addEventListener('focus', this._maintainFocus, true);
    document.addEventListener('keydown', this._bindKeypress);

    // Execute all callbacks registered for the `show` event
    this._fire('show', event);

    return this
  };

  /**
   * Hide the dialog element, enable all the targets (siblings), restore the
   * focus to the previously active element, stop listening for some specific
   * key presses and fire all registered callbacks for `hide` event
   *
   * @param {Event} event
   * @return {this}
   */
  A11yDialog.prototype.hide = function (event) {
    // If the dialog is already closed, abort
    if (!this.shown) {
      return this
    }

    this.shown = false;
    this.$el.setAttribute('aria-hidden', 'true');

    // If there was a focused element before the dialog was opened (and it has a
    // `focus` method), restore the focus back to it
    // See: https://github.com/KittyGiraudel/a11y-dialog/issues/108
    if (this._previouslyFocused && this._previouslyFocused.focus) {
      this._previouslyFocused.focus();
    }

    // Remove the focus event listener to the body element and stop listening
    // for specific key presses
    document.body.removeEventListener('focus', this._maintainFocus, true);
    document.removeEventListener('keydown', this._bindKeypress);

    // Execute all callbacks registered for the `hide` event
    this._fire('hide', event);

    return this
  };

  /**
   * Destroy the current instance (after making sure the dialog has been hidden)
   * and remove all associated listeners from dialog openers and closers
   *
   * @return {this}
   */
  A11yDialog.prototype.destroy = function () {
    // Hide the dialog to avoid destroying an open instance
    this.hide();

    // Remove the click event listener from all dialog openers
    this._openers.forEach(
      function (opener) {
        opener.removeEventListener('click', this._show);
      }.bind(this)
    );

    // Remove the click event listener from all dialog closers
    this._closers.forEach(
      function (closer) {
        closer.removeEventListener('click', this._hide);
      }.bind(this)
    );

    // Execute all callbacks registered for the `destroy` event
    this._fire('destroy');

    // Keep an object of listener types mapped to callback functions
    this._listeners = {};

    return this
  };

  /**
   * Register a new callback for the given event type
   *
   * @param {string} type
   * @param {Function} handler
   */
  A11yDialog.prototype.on = function (type, handler) {
    if (typeof this._listeners[type] === 'undefined') {
      this._listeners[type] = [];
    }

    this._listeners[type].push(handler);

    return this
  };

  /**
   * Unregister an existing callback for the given event type
   *
   * @param {string} type
   * @param {Function} handler
   */
  A11yDialog.prototype.off = function (type, handler) {
    var index = (this._listeners[type] || []).indexOf(handler);

    if (index > -1) {
      this._listeners[type].splice(index, 1);
    }

    return this
  };

  /**
   * Iterate over all registered handlers for given type and call them all with
   * the dialog element as first argument, event as second argument (if any). Also
   * dispatch a custom event on the DOM element itself to make it possible to
   * react to the lifecycle of auto-instantiated dialogs.
   *
   * @access private
   * @param {string} type
   * @param {Event} event
   */
  A11yDialog.prototype._fire = function (type, event) {
    var listeners = this._listeners[type] || [];
    var domEvent = new CustomEvent(type, { detail: event });

    this.$el.dispatchEvent(domEvent);

    listeners.forEach(
      function (listener) {
        listener(this.$el, event);
      }.bind(this)
    );
  };

  /**
   * Private event handler used when listening to some specific key presses
   * (namely ESCAPE and TAB)
   *
   * @access private
   * @param {Event} event
   */
  A11yDialog.prototype._bindKeypress = function (event) {
    // This is an escape hatch in case there are nested dialogs, so the keypresses
    // are only reacted to for the most recent one
    if (!this.$el.contains(document.activeElement)) return

    // If the dialog is shown and the ESCAPE key is being pressed, prevent any
    // further effects from the ESCAPE key and hide the dialog, unless its role
    // is 'alertdialog', which should be modal
    if (
      this.shown &&
      event.which === ESCAPE_KEY &&
      this.$el.getAttribute('role') !== 'alertdialog'
    ) {
      event.preventDefault();
      this.hide(event);
    }

    // If the dialog is shown and the TAB key is being pressed, make sure the
    // focus stays trapped within the dialog element
    if (this.shown && event.which === TAB_KEY) {
      trapTabKey(this.$el, event);
    }
  };

  /**
   * Private event handler used when making sure the focus stays within the
   * currently open dialog
   *
   * @access private
   * @param {Event} event
   */
  A11yDialog.prototype._maintainFocus = function (event) {
    // If the dialog is shown and the focus is not within a dialog element (either
    // this one or another one in case of nested dialogs) or within an element
    // with the `data-a11y-dialog-focus-trap-ignore` attribute, move it back to
    // its first focusable child.
    // See: https://github.com/KittyGiraudel/a11y-dialog/issues/177
    if (
      this.shown &&
      !event.target.closest('[aria-modal="true"]') &&
      !event.target.closest('[data-a11y-dialog-ignore-focus-trap]')
    ) {
      moveFocusToDialog(this.$el);
    }
  };

  /**
   * Convert a NodeList into an array
   *
   * @param {NodeList} collection
   * @return {Array<Element>}
   */
  function toArray(collection) {
    return Array.prototype.slice.call(collection)
  }

  /**
   * Query the DOM for nodes matching the given selector, scoped to context (or
   * the whole document)
   *
   * @param {String} selector
   * @param {Element} [context = document]
   * @return {Array<Element>}
   */
  function $$(selector, context) {
    return toArray((context || document).querySelectorAll(selector))
  }

  /**
   * Set the focus to the first element with `autofocus` with the element or the
   * element itself
   *
   * @param {Element} node
   */
  function moveFocusToDialog(node) {
    var focused = node.querySelector('[autofocus]') || node;

    focused.focus();
  }

  /**
   * Get the focusable children of the given element
   *
   * @param {Element} node
   * @return {Array<Element>}
   */
  function getFocusableChildren(node) {
    return $$(focusableSelectors.join(','), node).filter(function (child) {
      return !!(
        child.offsetWidth ||
        child.offsetHeight ||
        child.getClientRects().length
      )
    })
  }

  /**
   * Trap the focus inside the given element
   *
   * @param {Element} node
   * @param {Event} event
   */
  function trapTabKey(node, event) {
    var focusableChildren = getFocusableChildren(node);
    var focusedItemIndex = focusableChildren.indexOf(document.activeElement);

    // If the SHIFT key is being pressed while tabbing (moving backwards) and
    // the currently focused item is the first one, move the focus to the last
    // focusable item from the dialog element
    if (event.shiftKey && focusedItemIndex === 0) {
      focusableChildren[focusableChildren.length - 1].focus();
      event.preventDefault();
      // If the SHIFT key is not being pressed (moving forwards) and the currently
      // focused item is the last one, move the focus to the first focusable item
      // from the dialog element
    } else if (
      !event.shiftKey &&
      focusedItemIndex === focusableChildren.length - 1
    ) {
      focusableChildren[0].focus();
      event.preventDefault();
    }
  }

  function instantiateDialogs() {
    $$('[data-a11y-dialog]').forEach(function (node) {
      new A11yDialog(node);
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', instantiateDialogs);
    } else {
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(instantiateDialogs);
      } else {
        window.setTimeout(instantiateDialogs, 16);
      }
    }
  }

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  // Older browsers don't support event options, feature detect it.

  // Adopted and modified solution from Bohdan Didukh (2017)
  // https://stackoverflow.com/questions/41594997/ios-10-safari-prevent-scrolling-behind-a-fixed-overlay-and-maintain-scroll-posi

  var hasPassiveEvents = false;
  if (typeof window !== 'undefined') {
    var passiveTestOptions = {
      get passive() {
        hasPassiveEvents = true;
        return undefined;
      }
    };
    window.addEventListener('testPassive', null, passiveTestOptions);
    window.removeEventListener('testPassive', null, passiveTestOptions);
  }

  var isIosDevice = typeof window !== 'undefined' && window.navigator && window.navigator.platform && (/iP(ad|hone|od)/.test(window.navigator.platform) || window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);


  var locks = [];
  var documentListenerAdded = false;
  var initialClientY = -1;
  var previousBodyOverflowSetting = void 0;
  var previousBodyPosition = void 0;
  var previousBodyPaddingRight = void 0;

  // returns true if `el` should be allowed to receive touchmove events.
  var allowTouchMove = function allowTouchMove(el) {
    return locks.some(function (lock) {
      if (lock.options.allowTouchMove && lock.options.allowTouchMove(el)) {
        return true;
      }

      return false;
    });
  };

  var preventDefault = function preventDefault(rawEvent) {
    var e = rawEvent || window.event;

    // For the case whereby consumers adds a touchmove event listener to document.
    // Recall that we do document.addEventListener('touchmove', preventDefault, { passive: false })
    // in disableBodyScroll - so if we provide this opportunity to allowTouchMove, then
    // the touchmove event on document will break.
    if (allowTouchMove(e.target)) {
      return true;
    }

    // Do not prevent if the event has more than one touch (usually meaning this is a multi touch gesture like pinch to zoom).
    if (e.touches.length > 1) return true;

    if (e.preventDefault) e.preventDefault();

    return false;
  };

  var setOverflowHidden = function setOverflowHidden(options) {
    // If previousBodyPaddingRight is already set, don't set it again.
    if (previousBodyPaddingRight === undefined) {
      var _reserveScrollBarGap = !!options && options.reserveScrollBarGap === true;
      var scrollBarGap = window.innerWidth - document.documentElement.clientWidth;

      if (_reserveScrollBarGap && scrollBarGap > 0) {
        var computedBodyPaddingRight = parseInt(window.getComputedStyle(document.body).getPropertyValue('padding-right'), 10);
        previousBodyPaddingRight = document.body.style.paddingRight;
        document.body.style.paddingRight = computedBodyPaddingRight + scrollBarGap + 'px';
      }
    }

    // If previousBodyOverflowSetting is already set, don't set it again.
    if (previousBodyOverflowSetting === undefined) {
      previousBodyOverflowSetting = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
  };

  var restoreOverflowSetting = function restoreOverflowSetting() {
    if (previousBodyPaddingRight !== undefined) {
      document.body.style.paddingRight = previousBodyPaddingRight;

      // Restore previousBodyPaddingRight to undefined so setOverflowHidden knows it
      // can be set again.
      previousBodyPaddingRight = undefined;
    }

    if (previousBodyOverflowSetting !== undefined) {
      document.body.style.overflow = previousBodyOverflowSetting;

      // Restore previousBodyOverflowSetting to undefined
      // so setOverflowHidden knows it can be set again.
      previousBodyOverflowSetting = undefined;
    }
  };

  var setPositionFixed = function setPositionFixed() {
    return window.requestAnimationFrame(function () {
      // If previousBodyPosition is already set, don't set it again.
      if (previousBodyPosition === undefined) {
        previousBodyPosition = {
          position: document.body.style.position,
          top: document.body.style.top,
          left: document.body.style.left
        };

        // Update the dom inside an animation frame 
        var _window = window,
            scrollY = _window.scrollY,
            scrollX = _window.scrollX,
            innerHeight = _window.innerHeight;

        document.body.style.position = 'fixed';
        document.body.style.top = -scrollY;
        document.body.style.left = -scrollX;

        setTimeout(function () {
          return window.requestAnimationFrame(function () {
            // Attempt to check if the bottom bar appeared due to the position change
            var bottomBarHeight = innerHeight - window.innerHeight;
            if (bottomBarHeight && scrollY >= innerHeight) {
              // Move the content further up so that the bottom bar doesn't hide it
              document.body.style.top = -(scrollY + bottomBarHeight);
            }
          });
        }, 300);
      }
    });
  };

  var restorePositionSetting = function restorePositionSetting() {
    if (previousBodyPosition !== undefined) {
      // Convert the position from "px" to Int
      var y = -parseInt(document.body.style.top, 10);
      var x = -parseInt(document.body.style.left, 10);

      // Restore styles
      document.body.style.position = previousBodyPosition.position;
      document.body.style.top = previousBodyPosition.top;
      document.body.style.left = previousBodyPosition.left;

      // Restore scroll
      window.scrollTo(x, y);

      previousBodyPosition = undefined;
    }
  };

  // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#Problems_and_solutions
  var isTargetElementTotallyScrolled = function isTargetElementTotallyScrolled(targetElement) {
    return targetElement ? targetElement.scrollHeight - targetElement.scrollTop <= targetElement.clientHeight : false;
  };

  var handleScroll = function handleScroll(event, targetElement) {
    var clientY = event.targetTouches[0].clientY - initialClientY;

    if (allowTouchMove(event.target)) {
      return false;
    }

    if (targetElement && targetElement.scrollTop === 0 && clientY > 0) {
      // element is at the top of its scroll.
      return preventDefault(event);
    }

    if (isTargetElementTotallyScrolled(targetElement) && clientY < 0) {
      // element is at the bottom of its scroll.
      return preventDefault(event);
    }

    event.stopPropagation();
    return true;
  };

  var disableBodyScroll = function disableBodyScroll(targetElement, options) {
    // targetElement must be provided
    if (!targetElement) {
      // eslint-disable-next-line no-console
      console.error('disableBodyScroll unsuccessful - targetElement must be provided when calling disableBodyScroll on IOS devices.');
      return;
    }

    // disableBodyScroll must not have been called on this targetElement before
    if (locks.some(function (lock) {
      return lock.targetElement === targetElement;
    })) {
      return;
    }

    var lock = {
      targetElement: targetElement,
      options: options || {}
    };

    locks = [].concat(_toConsumableArray(locks), [lock]);

    if (isIosDevice) {
      setPositionFixed();
    } else {
      setOverflowHidden(options);
    }

    if (isIosDevice) {
      targetElement.ontouchstart = function (event) {
        if (event.targetTouches.length === 1) {
          // detect single touch.
          initialClientY = event.targetTouches[0].clientY;
        }
      };
      targetElement.ontouchmove = function (event) {
        if (event.targetTouches.length === 1) {
          // detect single touch.
          handleScroll(event, targetElement);
        }
      };

      if (!documentListenerAdded) {
        document.addEventListener('touchmove', preventDefault, hasPassiveEvents ? { passive: false } : undefined);
        documentListenerAdded = true;
      }
    }
  };

  var enableBodyScroll = function enableBodyScroll(targetElement) {
    if (!targetElement) {
      // eslint-disable-next-line no-console
      console.error('enableBodyScroll unsuccessful - targetElement must be provided when calling enableBodyScroll on IOS devices.');
      return;
    }

    locks = locks.filter(function (lock) {
      return lock.targetElement !== targetElement;
    });

    if (isIosDevice) {
      targetElement.ontouchstart = null;
      targetElement.ontouchmove = null;

      if (documentListenerAdded && locks.length === 0) {
        document.removeEventListener('touchmove', preventDefault, hasPassiveEvents ? { passive: false } : undefined);
        documentListenerAdded = false;
      }
    }

    if (isIosDevice) {
      restorePositionSetting();
    } else {
      restoreOverflowSetting();
    }
  };

  // import Swiper, { Navigation } from "swiper";

  /**
   * Sitenav et ClickyMenus
   */

  const menus = document.querySelectorAll(".clicky-menu");
  menus.forEach(menu => {
    let clickyMenu = new ClickyMenus(menu);
    clickyMenu.init();
  });

  /**
   * Sitenav-mobile : modale avec a11y-dialog
   * ========================================
   *
   * Le script original s'appuie une règle css "display: none"
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
    dialogContentBody.addEventListener("transitionend", modaleTransitions);
    dialogEl.classList.add("is-closing");
    dialogEl.classList.remove("is-visible");

    dialogTriggers.forEach((trigger) => {
      trigger.classList.remove("is-active");
    });
  });

  /**
   * Recherche : modale avec a11y-dialog
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
  // Swiper.use([Navigation]);
  // const sliderPortfolioArticle = document.querySelector(".p-article_portfolio");

  // if (sliderPortfolioArticle) {
  //   // const swiperPortfolio = new Swiper(sliderPortfolioArticle);
  // }

})();
