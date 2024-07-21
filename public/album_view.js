function showModal() {
  document.querySelector(".modal-container").classList.add("show");
}

function hideModal() {
  document.querySelector(".modal-container").classList.remove("show");
}

document
  .querySelector(".open-modal-button")
  .addEventListener("click", showModal);
document
  .querySelector(".close-modal-button")
  .addEventListener("click", hideModal);

document.addEventListener("DOMContentLoaded", function () {
  function adjustImageHeight() {
    const albumDesc = document.querySelector(".album-desc");
    const photos = document.querySelectorAll(".photo");
    photos.forEach((photo) => {
      const images = photo.querySelectorAll(".photo img");

      if (albumDesc && images.length) {
        const albumDescHeight = albumDesc.offsetHeight;

        const maxHeight =
          window.innerWidth > 780
            ? window.innerHeight - albumDescHeight - 200
            : window.innerHeight - albumDescHeight - 160;

        images.forEach((image) => {
          image.style.maxHeight = `${maxHeight}px`;
        });
      }
    });
  }

  adjustImageHeight(); // This will probably need to be called when the pop up is opened (maybe as well)

  function debounce(func, wait) {
    let timeout;
    return function () {
      const context = this,
        args = arguments;
      const later = function () {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const debouncedAdjustImageHeight = debounce(adjustImageHeight, 100);

  window.addEventListener("resize", debouncedAdjustImageHeight);
});
