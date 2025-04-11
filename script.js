let autoMode = false;
let interval;
let numberCache = [];

function startAuto() {
  autoMode = true;
  const msg = document.getElementById("message").value;
  if (numberCache.length === 0) return alert("No numbers!");

  let i = 0;
  interval = setInterval(() => {
    if (!autoMode || i >= numberCache.length) {
      stopAuto();
      return;
    }
    simulateMessageSend(numberCache[i], msg);
    i++;
  }, 20000); // Delay 20s per message
}

function stopAuto() {
  autoMode = false;
  clearInterval(interval);
  log("Stopped sending.");
}

function simulateMessageSend(number, message) {
  const frame = document.createElement("iframe");
  frame.src = `https://web.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(message)}`;
  frame.style.width = "1px";
  frame.style.height = "1px";
  frame.style.opacity = 0;
  document.body.appendChild(frame);

  setTimeout(() => {
    document.body.removeChild(frame);
    log(`Message sent to ${number}`);
  }, 6000);
}

function handleNumberInput(e) {
  if (e.key === "Enter") {
    const input = document.getElementById("numberInput");
    const number = input.value.trim();
    if (number && !numberCache.includes(number)) {
      numberCache.push(number);
      updateNumberList();
    }
    input.value = "";
  }
}

function updateNumberList() {
  const list = document.getElementById("numberList");
  list.innerHTML = "";
  numberCache.forEach(num => {
    const span = document.createElement("span");
    span.textContent = num;
    list.appendChild(span);
  });
  list.classList.remove("hidden");
}

function handleExcel(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();

  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const numbers = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    numbers.forEach(row => {
      const number = row[0];
      if (number && !numberCache.includes(number)) {
        numberCache.push(number.toString());
      }
    });

    updateNumberList();
  };
  reader.readAsArrayBuffer(file);
}

function downloadNumbers() {
  if (numberCache.length === 0) return alert("No numbers.");
  const ws = XLSX.utils.aoa_to_sheet(numberCache.map(n => [n]));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Numbers");
  XLSX.writeFile(wb, "numbers.xlsx");
}

function log(msg) {
  const logs = document.getElementById("statusLogs");
  logs.innerHTML += `<div>${new Date().toLocaleTimeString()} - ${msg}</div>`;
}
