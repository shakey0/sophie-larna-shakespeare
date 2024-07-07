async function initialize() {
  const source = document.head.querySelector("title").innerHTML;
  const response = await fetch("/.netlify/functions/init?source=" + source);
  const data = await response.json();
  console.log(data);

  document.getElementById("message").innerText = data.message;
}

initialize();
