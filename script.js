let autoMode = false;
let interval;

function startAuto() {
  autoMode = true;
  const msg = document.getElementById("message").value;
  log("Auto Mode Started");

  interval = setInterval(() => {
    if (!autoMode) return;
    simulateMessageSend(msg);
  }, 10000); // 10 seconds delay (adjustable)
}

function stopAuto() {
  autoMode = false;
  clearInterval(interval);
  log("Auto Mode Stopped");
}

function simulateMessageSend(msg) {
  const frame = document.createElement("iframe");
  frame.src = "https://web.whatsapp.com";
  frame.style.width = "1px";
  frame.style.height = "1px";
  frame.style.opacity = 0;
  document.body.appendChild(frame);

  setTimeout(() => {
    document.body.removeChild(frame);
    log(`Message sent: "${msg}"`);
  }, 5000);
}

function log(text) {
  const logs = document.getElementById("statusLogs");
  logs.innerHTML += `<div>${new Date().toLocaleTimeString()} - ${text}</div>`;
}
