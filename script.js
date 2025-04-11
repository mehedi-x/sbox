let numbersArray = [];
let message = '';

// Function to log in to WhatsApp Web and show QR code
function loginToWhatsApp() {
  const qrCodeContainer = document.getElementById("qrCodeContainer");
  qrCodeContainer.innerHTML = '<img src="https://upload.wikimedia.org/wikipedia/commons/6/6c/WhatsApp_logo_2023.svg" alt="QR Code" style="width: 150px;">';
  document.getElementById('whatsappWeb').style.display = 'block';
  setTimeout(() => {
    qrCodeContainer.innerHTML = '<img src="https://www.whatsapp.com/qr" alt="QR Code" style="width: 100%;">';
  }, 2000);
}

// Function to handle custom message input
function sendMessage() {
  message = document.getElementById('messageInput').value;
  if (!message) {
    alert('Please enter a message');
    return;
  }
  
  // Simulate sending message to all numbers
  numbersArray.forEach((number, index) => {
    setTimeout(() => {
      console.log(`Sending message to: ${number}`);
      document.getElementById('statusOutput').innerText = `Message sent to ${number}`;
    }, index * 5000); // Send messages with a 5-second delay between each
  });
}

// Function to handle file upload (CSV or Excel)
function uploadFile() {
  const file = document.getElementById('fileUpload').files[0];
  if (file) {
    let reader = new FileReader();
    reader.onload = function(e) {
      const fileContent = e.target.result;
      parseFileContent(fileContent);
    };
    reader.readAsText(file);
  }
}

// Function to parse CSV content
function parseFileContent(content) {
  const rows = content.split('\n');
  rows.forEach(row => {
    const number = row.trim();
    if (number) {
      numbersArray.push(number);
    }
  });
  alert('File uploaded successfully');
}

// Function to download numbers as CSV
function downloadNumbers() {
  const csvContent = "data:text/csv;charset=utf-8," + numbersArray.join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "whatsapp_numbers.csv");
  document.body.appendChild(link);
  link.click();
}
