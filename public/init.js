async function initialize() {
  const response = await fetch("/.netlify/functions/init");
  const data = await response.json();
  console.log(data);
  document.getElementById("serverResponse").innerText = data[1].word;
}

initialize();
