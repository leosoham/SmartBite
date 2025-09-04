const API_URL = "/savesearch";

const historyList = document.getElementById("historyList");
const emptyHistory = document.getElementById("emptyHistory");

// Go back to homepage
async function goBackToHomepage() {
  const token = localStorage.accessToken;

  try {
    const res = await fetch("/home", {
      'method': "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
    if (res.ok) {
      // const homepageContent = await res.text();
      window.location.href = "/home";

      // document.open();
      // document.write(homepageContent);
      // document.close();


      // const homepageContent = await res.text();
      // const parser = new DOMParser();
      // const doc = parser.parseFromString(homepageContent, "text/html");

      // Replace body with new content
      document.body.innerHTML = doc.body.innerHTML;

    } else {
      showError("Failed to load homepage.");
    }
  } catch (err) {
    console.error(err)
  }


}

// Redirect to product details page
function viewProductDetails(barcode) {
  window.location.href = `/product-info?barcode=${barcode}`;
}


// --- Fetch from OpenFoodFacts ---
async function fetchOpenFoodFacts(barcode) {
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Product API returned status: ${response.status} for barcode: ${barcode}`);
      throw new Error(`Failed to fetch product info: ${response.status}`);
    }
    
    const data = await response.json();

    if (data.status === 1 && data.product) {
      return {
        code: barcode,
        name: data.product.product_name || "Unknown Product",
        brand: data.product.brands || "Unknown Brand",
        scannedAt: new Date().toISOString()
      };
    } else {
      console.warn(`Product not found or invalid data for barcode: ${barcode}`);
      return {
        code: barcode,
        name: "Product not found",
        brand: "",
        scannedAt: new Date().toISOString()
      };
    }
  } catch (err) {
    console.error(`OpenFoodFacts error for barcode ${barcode}:`, err);
    return {
      code: barcode,
      name: err.name === "AbortError" ? "Request timed out" : "Error fetching product",
      brand: "",
      scannedAt: new Date().toISOString()
    };
  }
}

// --- Main history loader ---
async function loadHistory() {
  try {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");
    
    if (!token || !user) {
      console.error("Missing authentication data");
      showEmptyHistory("Please log in to view history");
      return;
    }

    // 1. Fetch codes from your backend
    const response = await fetch(`/savesearch?user=${encodeURIComponent(user)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    console.log("User: " + user);

    if (!response.ok) {
      console.error(`Failed to fetch history: ${response.status} ${response.statusText}`);
      showEmptyHistory("Failed to load history. Please try again later.");
      return;
    }
    
    const codes = await response.json();
    console.log("History data: ", codes);
    historyList.innerHTML = "";

    if (!Array.isArray(codes) || codes.length === 0) {
      showEmptyHistory("No scan history yet");
      return;
    } else {
      emptyHistory.style.display = "none";
    }

    // 2. For each code, fetch details from OpenFoodFacts
    for (const codel of codes) {
      const product = await fetchOpenFoodFacts(codel.code);

      const item = document.createElement("div");
      item.className = "history-item";
      item.onclick = () => viewProductDetails(product.code);
      console.log(codel.time)
      item.innerHTML = `
        <div class="product-info">
          <div class="product-name">${product.name}</div>
          <div class="barcode-number">${product.code}</div>
        </div>
        <div class="scan-date">${formatDate(codel.time)}</div>
      `;

      historyList.appendChild(item);
    }
  } catch (error) {
    console.error("Error loading history:", error);
    showEmptyHistory("Error loading history. Please try again later.");
  }
}

// --- Format dates ---
function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  return diffWeeks === 1 ? "1 week ago" : `${diffWeeks} weeks ago`;
}

// Helper function to show empty history with custom message
function showEmptyHistory(message) {
  emptyHistory.style.display = "block";
  const emptyText = emptyHistory.querySelector(".empty-text");
  if (emptyText) {
    emptyText.textContent = message;
  }
}

// Function to retry loading history
function retryLoadHistory() {
  console.log("Retrying history load...");
  loadHistory();
}

// Load on page ready and set up retry mechanism
document.addEventListener("DOMContentLoaded", () => {
  loadHistory();
  
  // If history fails to load initially, try again after a short delay
  setTimeout(() => {
    if (historyList.children.length === 0 && emptyHistory.style.display === "block") {
      retryLoadHistory();
    }
  }, 1500);
});
