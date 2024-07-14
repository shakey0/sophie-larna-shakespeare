// Function to show the modal
function showModal() {
  document.querySelector(".modal-container").classList.add("show");
}

// Function to hide the modal
function hideModal() {
  document.querySelector(".modal-container").classList.remove("show");
}

// Example usage
document
  .querySelector(".open-modal-button")
  .addEventListener("click", showModal);
document
  .querySelector(".close-modal-button")
  .addEventListener("click", hideModal);
