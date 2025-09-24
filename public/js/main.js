let currentUser = null;

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

  try {
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
      // Clear the form after successful submission
      form.reset();
      clear_canvas_content();
    } else if (response.status === 401) {
      alert("Please login to submit your drawing.");
      window.location.reload();
    } else {
      const error = await response.json();
      alert("Error: " + error.error);
    }
  } catch (error) {
    console.error("Submit error:", error);
    alert("Failed to submit drawing. Please try again.");
  }
};

function display_posts(data) {
  const pin_board = document.getElementById("submissions");
  pin_board.innerHTML = ''; // clear posts

  data.forEach((entry, index) => {
    const image = new Image();
    image.src = entry.image;
    image.style.display = "inline-block";
    image.style.maxWidth = "150px";
    image.style.maxHeight = "150px";
    image.style.borderRadius = "3%";
    image.style.borderStyle = "Dashed";
    image.style.borderWidth = "1px";

    const post = document.createElement("div");
    post.style.margin = "10px";
    post.style.padding = "10px";
    post.style.border = "1px solid #ccc";
    post.style.borderRadius = "5px";
    post.style.position = "relative";

    //only show edit/delete buttons for the current user's posts
    if (currentUser && entry._id === currentUser.id) {
      const delete_btn = document.createElement("button");
      delete_btn.textContent = "×";
      delete_btn.onclick = () => delete_post();
      delete_btn.style.backgroundColor = "#F58600";
      delete_btn.style.color = "white";
      delete_btn.style.width = "25px";
      delete_btn.style.height = "25px";
      delete_btn.style.float = "right";
      delete_btn.style.borderRadius = "50%";
      delete_btn.style.border = "none";
      delete_btn.style.cursor = "pointer";
      delete_btn.style.fontSize = "12px";
      delete_btn.style.hover

      const edit_btn = document.createElement("button");
      edit_btn.textContent = "✎";
      edit_btn.onclick = () => edit_post(entry);
      edit_btn.style.backgroundColor = "#9EDDFF";
      edit_btn.style.color = "white";
      edit_btn.style.width = "25px";
      edit_btn.style.height = "25px";
      edit_btn.style.float = "right";
      edit_btn.style.marginRight = "5px";
      edit_btn.style.borderRadius = "50%";
      edit_btn.style.border = "none";
      edit_btn.style.cursor = "pointer";
      edit_btn.style.fontSize = "12px";

      post.appendChild(delete_btn);
      post.appendChild(edit_btn);
    }

    //show github avi
    if (entry.avatar) {
      const avatar = document.createElement("img");
      avatar.src = entry.avatar;
      avatar.style.width = "30px";
      avatar.style.height = "30px";
      avatar.style.borderRadius = "50%";
      avatar.style.float = "left";
      avatar.style.marginRight = "10px";
      post.appendChild(avatar);
    }

    const post_name = document.createElement("p");
    post_name.textContent = `Name: ${entry.name}`;
    if (entry.username) {
      post_name.textContent += ` (@${entry.username})`;
    }
    
    const post_age = document.createElement("p");
    post_age.textContent = `Age: ${entry.age}`;
    
    const post_zodiac = document.createElement("p");
    post_zodiac.textContent = `Zodiac: ${entry.zodiac}`;

    post.style.textAlign = "center";

    const br = document.createElement("br");
    post.appendChild(br);
    post.appendChild(br);
    post.appendChild(post_name);
    post.appendChild(post_age);
    post.appendChild(post_zodiac);
    post.appendChild(image);
    pin_board.appendChild(post);
  });
}

async function check_authentication() {
  try {
    const response = await fetch("/auth/user");
    const authData = await response.json();
    
    if (authData.authenticated) {
      currentUser = authData.user;
      document.getElementById("not-authenticated").style.display = "none";
      document.getElementById("auth-card").style.display="none";
      document.getElementById("authenticated").style.display = "block";
      document.getElementById("app-content").style.display = "block";
      
      document.getElementById("user-name").textContent = authData.user.name || authData.user.username;
      const avatarImg = document.getElementById("user-avatar");
      if (authData.user.avatar) {
        avatarImg.src = authData.user.avatar;
        avatarImg.style.display = "inline";
      } else {
        avatarImg.style.display = "none";
      }
      
      if (authData.user.name) {
        document.getElementById("yourname").value = authData.user.name;
      }
      
      get_data();
      
      setTimeout(() => {
        if (typeof reinitialize_canvas === 'function') {
          reinitialize_canvas();
        }
      }, 100);
    } else {
      document.getElementById("not-authenticated").style.display = "block";
            document.getElementById("auth-card").style.display="block";
      document.getElementById("authenticated").style.display = "none";
      document.getElementById("app-content").style.display = "none";
    }
  } catch (error) {
    console.error("Auth check error:", error);
    document.getElementById("not-authenticated").style.display = "block";
    document.getElementById("authenticated").style.display = "none";
    document.getElementById("app-content").style.display = "none";
  }
}

async function get_data() {
  try {
    const server_data = await fetch("/results");
    if (server_data.ok) {
      const data = await server_data.json();
      display_posts(data);
    } else if (server_data.status === 401) {
      check_authentication();
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

async function edit_post(entry) {
  const new_name = prompt("Enter new name:", entry.name);
  if (new_name === null) return;

  const new_bday = prompt("Enter new birthday (YYYY-MM-DD):", entry.birthday);
  if (new_bday === null) return;

  try {
    const body = JSON.stringify({ name: new_name, birthday: new_bday, image: entry.image });
    const response = await fetch("/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body
    });

    if (response.ok) {
      const updated_data = await response.json();
      display_posts(updated_data);
    } else {
      const error = await response.json();
      alert("Error: " + error.error);
    }
  } catch (error) {
    console.error("Edit error:", error);
    alert("Failed to update. Please try again.");
  }
}

async function delete_post() {
  if (!confirm("Are you sure you want to delete your submission?")) {
    return;
  }

  try {
    const response = await fetch("/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });

    if (response.ok) {
      const updated_data = await response.json();
      display_posts(updated_data);
      // Clear the form as well
      document.querySelector("form").reset();
      clear_canvas_content();
    } else {
      const error = await response.json();
      alert("Error: " + error.error);
    }
  } catch (error) {
    console.error("Delete error:", error);
    alert("Failed to delete. Please try again.");
  }
}

function clear_canvas_content() {
  const canvas = document.getElementById("drawing_canvas");
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);
}

window.onload = function() {
  check_authentication();
  
  const button = document.querySelector("#submit_btn");
  const clear_btn = document.querySelector("#clear_btn");
  
  button.onclick = function(event) {
    submit(event);
  };

  clear_btn.onclick = function(event) {
    clear_canvas(event);
  };

};
