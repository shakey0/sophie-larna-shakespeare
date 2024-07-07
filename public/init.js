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
    const response = await fetch("/.netlify/functions/get_photos");
    const data2 = await response.json();
    console.log(data2);

    const photosDiv = document.getElementById("photos");
    photosDiv.innerHTML = "";
    data2.forEach((photo) => {
      if (photo && photo.body) {
        const img = document.createElement("img");
        img.src = `data:${photo.contentType};base64,${photo.body}`; // Use base64 encoded data
        img.alt = "Photo";
        img.style.width = "400px";
        img.style.height = "auto";
        photosDiv.appendChild(img);
      } else {
        console.error("Invalid photo object:", photo);
      }
    });
  }
}

initialize();
