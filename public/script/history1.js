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
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );

    if (!response.ok) throw new Error("Failed to fetch product info");
    const data = await response.json();

    if (data.status === 1) {
      return {
        code: barcode,
        name: data.product.product_name || "Unknown Product",
        brand: data.product.brands || "Unknown Brand",
        scannedAt: new Date().toISOString() // fallback if no date
      };
    } else {
      return {
        code: barcode,
        name: "Product not found",
        brand: "",
        scannedAt: new Date().toISOString()
      };
    }
  } catch (err) {
    console.error("OpenFoodFacts error:", err);
    return {
      code: barcode,
      name: "Error fetching product",
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

    // 1. Fetch codes from your backend
    const response = await fetch(`/savesearch?user=${encodeURIComponent(user)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
      // body: JSON.stringify({ user })
    });
    console.log("here is user" + user)

    if (!response.ok) throw new Error("Failed to fetch codes");
    const codes = await response.json(); // array like [2323, 34343, 46356]
    console.log("here is code ", codes)
    historyList.innerHTML = "";

    if (codes.length === 0) {
      emptyHistory.style.display = "block";
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
    emptyHistory.style.display = "block";
    emptyHistory.querySelector(".empty-text").textContent =
      "Error loading history";
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

// Load on page ready
document.addEventListener("DOMContentLoaded", loadHistory);
