let localConnection;
let sendChannel;
let receiveBuffer = [];
let receivedSize = 0;

const fileInput = document.getElementById('fileInput');
const startSend = document.getElementById('startSend');
const qrCanvas = document.getElementById('qrCanvas');
const remoteOffer = document.getElementById('remoteOffer');
const connectBtn = document.getElementById('connectBtn');
const autoConnect = document.getElementById('autoConnect');
const downloadLink = document.getElementById('downloadLink');
const hotspotCodeDisplay = document.getElementById('hotspotCodeDisplay');

const HOTSPOT_KEY = "hotspot_offer";

// Sender
startSend.onclick = async () => {
  const file = fileInput.files[0];
  if (!file) return alert('Please select a file.');

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

  const offer = await localConnection.createOffer();
  await localConnection.setLocalDescription(offer);

  localConnection.onicecandidate = e => {
    if (e.candidate === null) {
      const sdp = JSON.stringify(localConnection.localDescription);
      const code = Math.floor(1000 + Math.random() * 9000);
      localStorage.setItem(HOTSPOT_KEY, sdp);
      hotspotCodeDisplay.textContent = `Hotspot Code: ${code}`;
      generateQR(sdp);
    }
  };
};

// Receiver
autoConnect.onclick = () => {
  const offer = localStorage.getItem(HOTSPOT_KEY);
  if (!offer) {
    alert("No sender offer found on this network.");
    return;
  }
  remoteOffer.value = offer;
  connectBtn.click();
};

connectBtn.onclick = async () => {
  const sdp = remoteOffer.value;
  if (!sdp) return alert('Paste the sender offer or use Hotspot Connect');

  const remoteDesc = new RTCSessionDescription(JSON.parse(sdp));
  localConnection = new RTCPeerConnection();

  localConnection.ondatachannel = event => {
    const receiveChannel = event.channel;
    receiveChannel.binaryType = "arraybuffer";

    receiveChannel.onmessage = e => {
      if (e.data === "EOF") {
        const receivedBlob = new Blob(receiveBuffer);
        const downloadUrl = URL.createObjectURL(receivedBlob);
        downloadLink.innerHTML = `<a href="${downloadUrl}" download="received_file">Download File</a>`;
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
      prompt("Send this SDP back to sender:", JSON.stringify(localConnection.localDescription));
    }
  };
};

function generateQR(text) {
  new QRious({
    element: qrCanvas,
    value: text,
    size: 250
  });
}
