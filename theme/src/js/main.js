// import { ClickyMenus } from "./vendors/clicky-menus";
import A11yDialog from "a11y-dialog";
// import { SiteNavMobile } from "./modules/sitenav-mobile";


/*
const menus = document.querySelectorAll(".clicky-menu");

menus.forEach((menu) => {
  let clickyMenu = new ClickyMenus(menu);
  clickyMenu.init();
});
*/

const dialogSitenavMobile = document.getElementById("dialog-sitenav-mobile");
console.log(dialogSitenavMobile);
const dialog = new A11yDialog(dialogSitenavMobile);
dialog.on("show", function (dialogSitenavMobile, triggerEl) {
  console.log(dialogEl);
  console.log(triggerEl);
});
/**
 * sitenav version mobile
 */
// const triggerSiteNavMobile = document.querySelectorAll(".js-trigger-sitenav");

// triggerSiteNavMobile.forEach((trigger) => {
//   let siteNavMobile = new SiteNavMobile(trigger);
//   siteNavMobile.init();
// });
