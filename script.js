let localConnection;
let sendChannel;
let receiveBuffer = [];
let receivedSize = 0;

const fileInput = document.getElementById('fileInput');
const startSend = document.getElementById('startSend');
const qrCanvas = document.getElementById('qrCanvas');
const remoteOffer = document.getElementById('remoteOffer');
const connectBtn = document.getElementById('connectBtn');
const downloadLink = document.getElementById('downloadLink');

// Create QR from offer
function generateQR(text) {
  const qr = new QRious({
    element: qrCanvas,
    value: text,
    size: 250
  });
}

// Sender
startSend.onclick = async () => {
  const file = fileInput.files[0];
  if (!file) return alert('Select a file first!');

  localConnection = new RTCPeerConnection();
  sendChannel = localConnection.createDataChannel('file');

  sendChannel.onopen = () => {
    console.log('Data channel open, sending file...');
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
          sendChannel.send('EOF');
        }
      };
      const slice = file.slice(offset, o + chunkSize);
      reader.readAsArrayBuffer(slice);
    };
    readSlice(0);
  };

  const offer = await localConnection.createOffer();
  await localConnection.setLocalDescription(offer);

  localConnection.onicecandidate = e => {
    if (e.candidate === null) {
      generateQR(JSON.stringify(localConnection.localDescription));
    }
  };
};

// Receiver
connectBtn.onclick = async () => {
  const sdp = remoteOffer.value;
  if (!sdp) return alert('Paste sender\'s SDP offer!');

  const remoteDesc = new RTCSessionDescription(JSON.parse(sdp));
  localConnection = new RTCPeerConnection();

  localConnection.ondatachannel = event => {
    const receiveChannel = event.channel;
    receiveChannel.binaryType = 'arraybuffer';

    receiveChannel.onmessage = e => {
      if (e.data === 'EOF') {
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

// QR generator library (QRious)
const script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/npm/qrious";
document.body.appendChild(script);
