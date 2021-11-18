// import { ClickyMenus } from "./vendors/clicky-menus";
import A11yDialog from "a11y-dialog";

/**
 * Sitenav-mobile : modale avec a11y-dialog
 *
 */

// Id de la modale
const sitenavMobile = document.getElementById("dialog-sitenav-mobile");
// Boutons d'ouverture et de fermeture
const dialogTriggers = document.querySelectorAll(".c-sitenav_trigger");
const dialogSitenav = new A11yDialog(sitenavMobile);

dialogSitenav.on("show", (dialogEl, dialogEvent) => {
  dialogEl.classList.add("is-visible");
  // Animer les deux boutons en même temps, car ils sont affichés en superposition.
  dialogTriggers.forEach((trigger) => {
    trigger.classList.add("is-active");
  });
});

dialogSitenav.on("hide", (dialogEl, dialogEvent) => {
  dialogEl.classList.remove("is-visible");
  dialogTriggers.forEach((trigger) => {
    trigger.classList.remove("is-active");
  });
});


/*
const menus = document.querySelectorAll(".clicky-menu");

menus.forEach((menu) => {
  let clickyMenu = new ClickyMenus(menu);
  clickyMenu.init();
});
*/
