const response = await fetch("/.netlify/functions/init");
const data = await response.json();
document.getElementById("serverResponse").innerText = data.message;
