async function initialize() {
  const source = document.head.querySelector("title").innerHTML;
  const response = await fetch("/.netlify/functions/init?source=" + source);
  const data = await response.json();
  console.log(data);

  const container = document.querySelector(".albums");
  data.forEach((album) => {
    const albumElement = document.createElement("div");
    albumElement.classList.add("album");

    const coverPhoto = document.createElement("img");
    coverPhoto.src = `data:${album.coverPhoto.contentType};base64,${album.coverPhoto.body}`;
    coverPhoto.alt = album.name;
    albumElement.appendChild(coverPhoto);

    const title = document.createElement("h2");
    title.classList.add("s-v-mgn");
    title.textContent = album.name;
    albumElement.appendChild(title);

    const description = document.createElement("p");
    description.textContent = album.desc;
    description.classList.add("s-v-mgn");
    albumElement.appendChild(description);

    const albumDate = album.date;
    if (albumDate) {
      const dateObj = new Date(albumDate);
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const month = monthNames[dateObj.getUTCMonth()];
      const year = dateObj.getUTCFullYear();
      const formattedDate = `Taken ${month} ${year}`;
      const date = document.createElement("p");
      date.classList.add("album-date");
      date.classList.add("s-v-mgn");
      date.textContent = formattedDate;
      date.classList.add("s-v-mgn");
      albumElement.appendChild(date);
    }

    container.appendChild(albumElement);
  });
}

initialize();
