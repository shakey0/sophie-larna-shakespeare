function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function formatAlbumDate(albumDate, isBirthday = false) {
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
  if (isBirthday) {
    const day = dateObj.getUTCDate();
    return `the ${day}${getOrdinalSuffix(day)} of ${month}, ${year}`;
  }
  return `${month} ${year}`;
}

async function initialize() {
  const source = document.head.querySelector("title").innerHTML;
  const response = await fetch("/.netlify/functions/init?source=" + source);
  const data = await response.json();
  console.log(data);

  const profileData = document.querySelector(".left-container");
  const profilePhotoContainer = document.querySelector(".image-container");
  const albumContainer = document.querySelector(".albums");

  data.forEach((album) => {
    if (album.entryType === `MA${source.toLowerCase()}`) {
      const profilePhoto = document.createElement("img");
      profilePhoto.src = `data:${album.coverPhoto.contentType};base64,${album.coverPhoto.body}`;
      profilePhoto.alt = album.name;
      profilePhotoContainer.appendChild(profilePhoto);

      const birthday = album.date;
      const formattedBirthday =
        source + " was born on " + formatAlbumDate(birthday, true) + ".";
      const birthdaySentence = document.createElement("p");
      birthdaySentence.classList.add("date-sentence");
      birthdaySentence.textContent = formattedBirthday;
      profileData.appendChild(birthdaySentence);

      const description = document.createElement("p");
      description.textContent = album.desc;
      description.classList.add("ml-v-mgn");
      profileData.appendChild(description);
    } else if (album.entryType === `AA${source.toLowerCase()}`) {
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

      const albumDate = album.date;
      if (albumDate) {
        const formattedDate = "Taken in " + formatAlbumDate(albumDate);
        const date = document.createElement("p");
        date.classList.add("date-sentence");
        date.textContent = formattedDate;
        albumElement.appendChild(date);
      }

      const description = document.createElement("p");
      description.textContent = album.desc;
      description.classList.add("s-v-mgn");
      albumElement.appendChild(description);

      albumContainer.appendChild(albumElement);
    }
  });
}

initialize();
