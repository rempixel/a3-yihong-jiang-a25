const submit = async function(event) {
  event.preventDefault();

  const canvas = document.getElementById("drawing_canvas");
  const form = document.querySelector("form");
  const form_data = new FormData(form);

  // convert canvas image to base64 DataURL
  const data_url = canvas.toDataURL("image/jpeg");
  form_data.append("image", data_url);

  const data = Object.fromEntries(form_data.entries());
  const body = JSON.stringify(data);

  const response = await fetch("/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body
  });

  if (response.ok) {
    const updated_data = await response.json();
    display_posts(updated_data);
  }
};

function display_posts(data) {
  const pin_board = document.getElementById("submissions");
  pin_board.innerHTML = ''; // clear posts

  data.forEach((entry, index) => {
    const image = new Image();
    image.src = entry.image;
    image.style.maxWidth = "150px";
    image.style.maxHeight = "150px";
    image.style.borderRadius = "3%";
    image.style.borderStyle = "Dashed";
    image.style.borderWidth = "1px";

    const post = document.createElement("div");

    const delete_btn = document.createElement("button");
    delete_btn.onclick = () => delete_post(index);
    delete_btn.style.backgroundColor = "#ff6961";
    delete_btn.style.color = "white";
    delete_btn.style.width = "15px";
    delete_btn.style.height = "15px";
    delete_btn.style.float = "right";
    delete_btn.style.borderRadius = "50%";
    delete_btn.style.border = "none";
    delete_btn.style.cursor = "pointer";

    const edit_btn = document.createElement("button");
    edit_btn.onclick = () => edit_post(index, entry);
    edit_btn.style.backgroundColor = "#87CEEB";
    edit_btn.style.marginRight = "2px";
    edit_btn.style.color = "white";
    edit_btn.style.width = "15px";
    edit_btn.style.height = "15px";
    edit_btn.style.float = "right";
    edit_btn.style.borderRadius = "50%";
    edit_btn.style.border = "none";
    edit_btn.style.cursor = "pointer";

    const post_name = document.createElement("p");
    post_name.textContent = `Name: ${entry.name}`;
    
    const post_age = document.createElement("p");
    post_age.textContent = `Age: ${entry.age}`;
    
    const post_zodiac = document.createElement("p");
    post_zodiac.textContent = `Zodiac: ${entry.zodiac}`;
    
    post.appendChild(delete_btn);
    post.appendChild(edit_btn);
    post.appendChild(post_name);
    post.appendChild(post_age);
    post.appendChild(post_zodiac);
    post.appendChild(image);
    pin_board.appendChild(post);
  });
}

async function get_data() {
  const server_data = await fetch("/results");
  const data = await server_data.json();
  display_posts(data);
}

async function edit_post(index, entry) {
  const new_name = prompt("Enter new name:", entry.name);
  if (new_name === null) return;

  const new_bday = prompt("Enter new birthday:", entry.birthday);
  if (new_bday === null) return;

  const body = JSON.stringify({ index, name: new_name, birthday: new_bday, image: entry.image });
  const response = await fetch("/edit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body
  });

  if (response.ok) {
    const updated_data = await response.json();
    display_posts(updated_data);
  }
}

async function delete_post(index) {
  const body = JSON.stringify({ index });
  const response = await fetch("/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body
  });

  if (response.ok) {
    const updated_data = await response.json();
    display_posts(updated_data);
  }
}

window.onload = function() {
  const button = document.querySelector("#submit_btn");
  button.onclick = function(event) {
    submit(event);
  };
  get_data(); // load initial data
};
