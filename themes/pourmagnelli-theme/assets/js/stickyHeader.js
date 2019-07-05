(function() {
  var header = document.querySelector("#header");
  var offsetValue = header.getBoundingClientRect().height / 2;
  var headroom  = new Headroom(header, {
    tolerance: 5,
    offset: offsetValue,
    classes: {
      initial: "animated",
      pinned: "slideDown",
      unpinned: "slideUp"
    }
  });

  // console.log(offsetValue);

  headroom.init();

  window.addEventListener("resize", function(e) {
    offsetValue = header.getBoundingClientRect().height;
    // console.log(offsetValue);
    headroom.offset = offsetValue;
  }, false);
}());
