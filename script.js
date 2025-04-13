let localConnection;
let sendChannel;
let receiveBuffer = [];
let receivedSize = 0;
const HOTSPOT_KEY = "hotspot_offer";

// Sender Section
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('fileInput');
const qrCanvas = document.getElementById('qrCanvas');
const statusMessage = document.getElementById('status');

// For Drag and Drop
dropArea.addEventListener('dragover', (e) => e.preventDefault());
dropArea.addEventListener('drop', (e) => handleDrop(e));

function handleDrop(event) {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (file) {
    sendFile(file);
  }
}

function sendFile(file) {
  statusMessage.innerText = 'Preparing to send...';
  localConnection = new RTCPeerConnection();
  sendChannel = localConnection.createDataChannel("file");

  sendChannel.onopen = () => {
    const chunkSize = 16384;
    let offset = 0;
    const readSlice = o => {
      const reader = new FileReader();
      reader.onload = e => {
        sendChannel.send(e.target.result);
        offset += e.target.result.byteLength;
        if (offset < file.size) {
          readSlice(offset);
        } else {
          sendChannel.send("EOF");
        }
      };
      const slice = file.slice(offset, offset + chunkSize);
      reader.readAsArrayBuffer(slice);
    };
    readSlice(0);
  };

  localConnection.createOffer().then(offer => {
    localConnection.setLocalDescription(offer);
    localConnection.onicecandidate = e => {
      if (e.candidate === null) {
        const sdp = JSON.stringify(localConnection.localDescription);
        localStorage.setItem(HOTSPOT_KEY, sdp);
        statusMessage.innerText = 'Hotspot connected! Waiting for receiver...';
        generateQR(sdp);
      }
    };
  });
}

// Receiver Section - Auto Connect
window.onload = async () => {
  const sdp = localStorage.getItem(HOTSPOT_KEY);
  if (!sdp) return;

  const remoteDesc = new RTCSessionDescription(JSON.parse(sdp));
  localConnection = new RTCPeerConnection();

  localConnection.ondatachannel = event => {
    const receiveChannel = event.channel;
    receiveChannel.binaryType = "arraybuffer";

    receiveChannel.onmessage = e => {
      if (e.data === "EOF") {
        const receivedBlob = new Blob(receiveBuffer);
        const downloadUrl = URL.createObjectURL(receivedBlob);
        document.getElementById('downloadLink').innerHTML = `<a href="${downloadUrl}" download="received_file">Download File</a>`;
        receiveBuffer = [];
        return;
      }
      receiveBuffer.push(e.data);
      receivedSize += e.data.byteLength;
    };
  };

  await localConnection.setRemoteDescription(remoteDesc);
  const answer = await localConnection.createAnswer();
  await localConnection.setLocalDescription(answer);

  localConnection.onicecandidate = e => {
    if (e.candidate === null) {
      console.log("Receiver SDP ready:", JSON.stringify(localConnection.localDescription));
    }
  };
};

// Generate QR for Sender's Offer
function generateQR(text) {
  new QRious({
    element: qrCanvas,
    value: text,
    size: 200
  });
}
