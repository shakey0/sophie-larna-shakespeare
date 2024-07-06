document.getElementById("upload").addEventListener("click", async (event) => {
  event.preventDefault();

  const form = document.getElementById("uploadForm");
  const formData = new FormData(form);
  // const formObject = Object.fromEntries(formData.entries());
  console.log(formData);
  const response = await fetch("/.netlify/functions/uploader", {
    method: "POST",
    body: formData,
    // body: JSON.stringify(formObject),
  });
  const data = await response.json();
  console.log(data);
});
