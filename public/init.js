async function initialize() {
  const response = await fetch("/.netlify/functions/init");
  const data = await response.json();
  console.log(data);

  const source = document.head.querySelector("title").innerHTML;
  document.getElementById("sourceLog").innerText = source;

  if (source === "Amber") {
    document.getElementById("sourceLog").style.color = "orange";
    document.getElementById("serverResponse").innerText = data[1].word;
  } else if (source === "Sophie") {
    document.getElementById("sourceLog").style.color = "blue";
    document.getElementById("serverResponse").innerText = data[2].word;
  }
}

initialize();
