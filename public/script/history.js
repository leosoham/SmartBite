// History page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load user's scan history
    loadScanHistory();
});

// Back button functionality
function goBackToHomepage() {
    window.location.href = '/home';
}

// Load scan history (simulate API call)
function loadScanHistory() {
    // In a real application, you would fetch this from your backend
    // For now, we're using the sample data already in the HTML
    
    const historyItems = document.querySelectorAll('.history-item');
    const emptyHistory = document.getElementById('emptyHistory');
    
    // Show empty state if no history items
    if (historyItems.length === 0) {
        emptyHistory.style.display = 'block';
    } else {
        emptyHistory.style.display = 'none';
    }
    
    console.log(`Loaded ${historyItems.length} history items`);
}

// View product details when history item is clicked
function viewProductDetails(barcodeNumber) {
    console.log('Viewing product details for barcode:', barcodeNumber);
    
    // Here you would navigate to the product details page
    // For now, we'll show an alert
    alert(`Loading details for product with barcode: ${barcodeNumber}`);
    
    // TODO: Implement navigation to product details page
    // window.location.href = `product-details.html?barcode=${barcodeNumber}`;
}

// Function to add new scan to history (to be called from homepage)
function addToHistory(productName, barcodeNumber) {
    // This function would be called when a new product is scanned
    // In a real app, this would save to backend and update the UI
    
    const historyList = document.getElementById('historyList');
    const emptyHistory = document.getElementById('emptyHistory');
    
    // Hide empty state
    emptyHistory.style.display = 'none';
    
    // Create new history item
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.onclick = () => viewProductDetails(barcodeNumber);
    
    historyItem.innerHTML = `
        <div class="product-info">
            <div class="product-name">${productName}</div>
            <div class="barcode-number">${barcodeNumber}</div>
        </div>
        <div class="scan-date">Just now</div>
    `;
    
    // Add to top of list
    historyList.insertBefore(historyItem, historyList.firstChild);
    
    console.log('Added to history:', productName, barcodeNumber);
}

// Function to clear all history (optional feature)
function clearHistory() {
    if (confirm('Are you sure you want to clear all scan history?')) {
        const historyList = document.getElementById('historyList');
        const emptyHistory = document.getElementById('emptyHistory');
        
        // Remove all history items
        const historyItems = historyList.querySelectorAll('.history-item');
        historyItems.forEach(item => item.remove());
        
        // Show empty state
        emptyHistory.style.display = 'block';
        
        console.log('History cleared');
        
        // TODO: Also clear from backend
    }
}
