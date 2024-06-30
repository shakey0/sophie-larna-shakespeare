document.getElementById("fetchMessage").addEventListener("click", async () => {
  const response = await fetch("/.netlify/functions/hello");
  const data = await response.json();
  document.getElementById("message").innerText = data.message;
});
