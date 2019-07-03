(function ($) {
  //
  // Pour déterminer si le scroll doit être déactivé ou pas
  // https://stackoverflow.com/questions/28431933/how-to-save-state-of-toggleclass-method-using-jquery-cookie-plugin
  //
  var $menu = $(".js-menu-mobile"),
      $btn = $(".js-btn"),
      sel = false;

  $btn.on("click", function() {
    sel = !sel;

    $btn.toggleClass("is-open");
    $menu.toggleClass("is-open", sel);

    if (sel) {
      bodyScrollLock.disableBodyScroll($menu);
    } else {
      bodyScrollLock.enableBodyScroll($menu);
    }

  });
})(jQuery);
