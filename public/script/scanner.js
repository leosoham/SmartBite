

// NutriScan - Scanner logic (QuaggaJS)
const cameraEl = document.getElementById("camera");
const statusEl = document.getElementById("status");
const outputEl = document.getElementById("output");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const fileInput = document.getElementById("fileInput");
const productDetailsEl = document.getElementById("productDetails");

// New button for scanning again
let scanAgainBtn;
if (!document.getElementById("scanAgainBtn")) {
  scanAgainBtn = document.createElement("button");
  scanAgainBtn.id = "scanAgainBtn";
  scanAgainBtn.textContent = "Scan Again";
  scanAgainBtn.style.display = "none";
  document.getElementById("controls").appendChild(scanAgainBtn);
} else {
  scanAgainBtn = document.getElementById("scanAgainBtn");
}

let running = false;
let lastResults = [];

// Quagga config
const quaggaConfig = {
  inputStream: {
    name: "Live",
    type: "LiveStream",
    target: cameraEl,
    constraints: { facingMode: "environment" }
  },
  decoder: {
    readers: ["ean_reader", "ean_8_reader", "code_128_reader"]
  },
  locate: true,
  locator: { patchSize: "medium" }
};

async function addSearch(term) {
  const token  = localStorage.accessToken;
  const user = localStorage.user;
  try {
    const response = await fetch("/savesearch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // token stored in memory/localStorage
      },
      body: JSON.stringify({
        user: user, // replace with your stored username
        term: term
      })
    });

    if (!response.ok) {
      throw new Error("Failed to add search");
    }

    const data = await response.json();
    console.log("✅ Search saved:", data);
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

function startScanner() {
  if (running) return;
  statusEl.textContent = "Starting camera…";
  Quagga.init(quaggaConfig, (err) => {
    if (err) {
      console.error(err);
      statusEl.textContent = "Error starting camera: " + err;
      return;
    }
    Quagga.start();
    running = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    scanAgainBtn.style.display = "none";
    statusEl.textContent = "Point your camera at a barcode inside the green box…";
  });

  Quagga.offProcessed();
  Quagga.onProcessed((result) => {
    const drawingCtx = Quagga.canvas.ctx.overlay;
    const drawingCanvas = Quagga.canvas.dom.overlay;

    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

    if (result && result.boxes) {
      result.boxes
        .filter((box) => box !== result.box)
        .forEach((box) => {
          Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
            color: "green",
            lineWidth: 2
          });
        });
    }

    if (result && result.box) {
      Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
        color: "green",
        lineWidth: 4
      });
    }
  });

  

  Quagga.offDetected();
  Quagga.onDetected((res) => {
    const code = res?.codeResult?.code;
    if (!code) return;

    lastResults.push(code);
    if (lastResults.length > 3) lastResults.shift();

    if (lastResults.filter((c) => c === code).length >= 3) {
      statusEl.textContent = "Detected: " + code;
      const scannedData = {
        barcode: code,
        scanned_at: new Date().toISOString(),
        user_id: "TEMP_USER"
      };
      outputEl.textContent = JSON.stringify(scannedData, null, 2);

      // Redirect to product info route with barcode parameter
      addSearch(code)
      window.location.href = `/product-info?barcode=${code}`;

      stopScanner();
      scanAgainBtn.style.display = "inline-block";
    }
  });
}

function stopScanner() {
  if (!running) return;
  Quagga.stop();
  running = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;
  statusEl.textContent = "Stopped.";
}

// Enhanced image upload with multiple detection methods
fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) {
    console.log('No file selected');
    return;
  }
  
  console.log('File selected:', file.name, file.type, file.size);
  statusEl.textContent = "Processing image…";

  try {
    // Method 1: Try QuaggaJS first
    const barcode = await tryQuaggaDetection(file);
    if (barcode) {
      console.log('Barcode detected with QuaggaJS:', barcode);
      handleSuccessfulDetection(barcode);
      return;
    }

    // Method 2: Try with different Quagga settings
    const barcode2 = await tryQuaggaWithDifferentSettings(file);
    if (barcode2) {
      console.log('Barcode detected with alternative settings:', barcode2);
      handleSuccessfulDetection(barcode2);
      return;
    }

    // Method 3: Try with image preprocessing
    const barcode3 = await tryWithImagePreprocessing(file);
    if (barcode3) {
      console.log('Barcode detected with preprocessing:', barcode3);
      handleSuccessfulDetection(barcode3);
      return;
    }

    // If all methods fail
    console.log('All detection methods failed');
    statusEl.textContent = "Could not detect a barcode. Please try a clearer image or use manual input.";
    
    // Show manual input option
    showManualInputOption();
    
  } catch (error) {
    console.error('Error in image processing:', error);
    statusEl.textContent = "Error processing image. Please try again.";
  }
});

// Method 1: Standard Quagga detection
function tryQuaggaDetection(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      Quagga.decodeSingle(
        {
          src: reader.result,
          numOfWorkers: 0,
          decoder: { readers: ["ean_reader", "ean_8_reader", "code_128_reader"] },
          locate: true
        },
        (result) => {
          console.log('Quagga result:', result);
          if (result && result.codeResult) {
            resolve(result.codeResult.code);
          } else {
            resolve(null);
          }
        }
      );
    };
    reader.readAsDataURL(file);
  });
}

// Method 2: Quagga with different settings
function tryQuaggaWithDifferentSettings(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      Quagga.decodeSingle(
        {
          src: reader.result,
          numOfWorkers: 2,
          decoder: { 
            readers: ["ean_reader", "ean_8_reader", "code_128_reader", "upc_reader", "upc_e_reader"],
            multiple: false
          },
          locate: true,
          locator: { patchSize: "large" }
        },
        (result) => {
          console.log('Quagga alternative result:', result);
          if (result && result.codeResult) {
            resolve(result.codeResult.code);
          } else {
            resolve(null);
          }
        }
      );
    };
    reader.readAsDataURL(file);
  });
}

// Method 3: Image preprocessing (basic)
function tryWithImagePreprocessing(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Create canvas for image processing
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image
        ctx.drawImage(img, 0, 0);
        
        // Basic preprocessing: increase contrast
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const threshold = 128;
          const value = avg > threshold ? 255 : 0;
          data[i] = data[i + 1] = data[i + 2] = value;
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Try detection with processed image
        Quagga.decodeSingle(
          {
            src: canvas.toDataURL(),
            numOfWorkers: 0,
            decoder: { readers: ["ean_reader", "ean_8_reader", "code_128_reader"] },
            locate: true
          },
          (result) => {
            console.log('Preprocessed image result:', result);
            if (result && result.codeResult) {
              resolve(result.codeResult.code);
            } else {
              resolve(null);
            }
          }
        );
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

//




// Handle successful barcode detection
function handleSuccessfulDetection(barcode) {
  statusEl.textContent = "Detected (from image): " + barcode;
  const scannedData = {
    barcode: barcode,
    scanned_at: new Date().toISOString(),
    user_id: "TEMP_USER"
  };
  outputEl.textContent = JSON.stringify(scannedData, null, 2);

  // Redirect to product info route with barcode parameter
  console.log('Redirecting to product-info with barcode:', barcode);
  addSearch(barcode)
  window.location.href = `/product-info?barcode=${barcode}`;
}

// Show manual input option when detection fails
function showManualInputOption() {
  const manualContainer = document.querySelector('.manual-input-container');
  if (manualContainer) {
    manualContainer.style.display = 'block';
    manualContainer.style.background = '#fff3cd';
    manualContainer.style.padding = '10px';
    manualContainer.style.borderRadius = '5px';
    manualContainer.style.border = '1px solid #ffeaa7';
  }
  
  // Clear file input
  setTimeout(() => {
    fileInput.value = '';
  }, 2000);
}

// Manual barcode input functionality
const manualBarcodeInput = document.getElementById('manualBarcodeInput');
const manualBarcodeBtn = document.getElementById('manualBarcodeBtn');

if (manualBarcodeInput && manualBarcodeBtn) {
  manualBarcodeBtn.addEventListener('click', () => {
    const barcode = manualBarcodeInput.value.trim();
    if (barcode && /^\d{12,13}$/.test(barcode)) {
      console.log('Manual barcode entered:', barcode);
      statusEl.textContent = "Looking up barcode: " + barcode;
      addSearch(barcode)
      window.location.href = `/product-info?barcode=${barcode}`;
    } else {
      statusEl.textContent = "Please enter a valid 12-13 digit barcode.";
      manualBarcodeInput.focus();
    }
  });

  // Allow Enter key to submit manual barcode
  manualBarcodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      manualBarcodeBtn.click();
    }
  });
}

// Scan Again handler
scanAgainBtn.addEventListener("click", () => {
  lastResults = [];
  startScanner();
});

// Buttons
startBtn.addEventListener("click", startScanner);
stopBtn.addEventListener("click", stopScanner);
