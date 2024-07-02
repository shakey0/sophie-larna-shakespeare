document.getElementById("submit").addEventListener("click", async (event) => {
  event.preventDefault();

  const form = document.getElementById("postForm");
  const formData = new FormData(form);
  const formObject = Object.fromEntries(formData.entries());
  console.log(formData);
  const response = await fetch("/.netlify/functions/post", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formObject),
  });
  const data = await response.json();
  console.log(data);
  document.getElementById("postResponse").innerText = data[0].word;
});
