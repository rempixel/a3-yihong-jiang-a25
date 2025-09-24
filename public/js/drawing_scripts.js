const canvas = document.getElementById("drawing_canvas");
const context = canvas.getContext("2d");

let drawing = false;
let x = 0;
let y = 0;
context.fillStyle = "white";
context.fillRect(0, 0, canvas.width, canvas.height);

canvas.addEventListener('mousedown', (event) =>{
    drawing = true;
    const pos = get_canvas_position(event);
    x = pos.x;
    y = pos.y;
})

canvas.addEventListener('mousemove', (event) => {
    canvas.style.cursor = 'crosshair';
    if (!drawing) return;

    const pos = get_canvas_position(event);
    
    context.beginPath();
    context.lineWidth = 5;
    context.strokeStyle = 'black';
    context.lineCap = 'round';
    context.moveTo(x, y);
    x = pos.x;
    y = pos.y;
    context.lineTo(x, y);
    context.stroke();
})

canvas.addEventListener('mouseup', (event) => {
    drawing = false;
})

function clear_canvas(event) {
   event.preventDefault();
   context.clearRect(0, 0, canvas.width, canvas.height);
   context.fillStyle = "white";
   context.fillRect(0, 0, canvas.width, canvas.height);
}

function reinitialize_canvas() {
  if (canvas) {
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function get_canvas_position(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}