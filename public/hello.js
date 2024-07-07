async function hello() {
  const response = await fetch("/.netlify/functions/hello");
  const data = await response.json();
  console.log(data);
  document.getElementById("hello").innerText = data.message;
}

hello();
