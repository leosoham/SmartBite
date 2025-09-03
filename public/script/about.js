// About page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add any page-specific functionality here
    console.log('About page loaded');
});

// Back button functionality
function goBack() {
    // Check if there's a previous page in history
    if (window.history.length > 1) {
        window.history.back();
    } else {
        // If no history, go to homepage
        window.location.href = '/home';
    }
}

// Alternative back function that always goes to homepage
function goToHomepage() {
    window.location.href = 'homepage.html';
}
