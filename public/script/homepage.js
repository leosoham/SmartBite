// Sidebar functionality
document.addEventListener('DOMContentLoaded', function () {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    // Toggle sidebar
    hamburgerMenu.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);

    function toggleSidebar() {
        hamburgerMenu.classList.toggle('active');
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
    }

    function closeSidebar() {
        hamburgerMenu.classList.remove('active');
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    }

    // Close sidebar when clicking on a sidebar item
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', closeSidebar);
    });
});

const goToScanner = async ()=>{
    window.location.href = '/scanner'
    // const token = localStorage.accessToken
    // const user = localStorage.user
   
    //      const res = await fetch("/scanner", {
    //   'method': "GET",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": `Bearer ${token}`
    //   }
    // })
    // if (res.ok) {
    //   // const homepageContent = await res.text();
    //   window.location.href = "/scanner";

    // }
}

// Camera functionality
let cameraStream = null;

function openCamera() {
    const cameraModal = document.getElementById('cameraModal');
    const cameraVideo = document.getElementById('cameraVideo');

    cameraModal.classList.add('active');

    // Request camera access
    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: 'environment' // Use back camera for barcode scanning
        }
    })
        .then(function (stream) {
            cameraStream = stream;
            cameraVideo.srcObject = stream;
        })
        .catch(function (err) {
            console.error('Error accessing camera:', err);
            alert('Unable to access camera. Please ensure you have granted camera permissions.');
            closeCamera();
        });
}

function closeCamera() {
    const cameraModal = document.getElementById('cameraModal');
    const cameraVideo = document.getElementById('cameraVideo');

    cameraModal.classList.remove('active');

    // Stop camera stream
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }

    cameraVideo.srcObject = null;
}

function captureBarcode() {
    // Simulate barcode detection
    const detectedBarcode = '3948764012273'; // This would come from barcode scanning library
    console.log('Barcode detected:', detectedBarcode);

    closeCamera();

    // Navigate to product info page with barcode parameter
    window.location.href = `product-info.html?barcode=${detectedBarcode}`;
}

// File upload functionality
function uploadBarcode() {
    const fileInput = document.getElementById('fileInput');
    fileInput.click();
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        console.log('Processing uploaded image:', file.name);

        // Simulate barcode processing
        setTimeout(() => {
            const detectedBarcode = '6294003539054'; // This would come from image processing
            window.location.href = `product-info.html?barcode=${detectedBarcode}`;
        }, 1000);
    }
}

// Sidebar navigation functions
function navigateToProfile() {
    console.log('Navigating to Profile');
    window.location.href = '/profile';
}


function navigateToHistory() {
    console.log('Navigating to History');
    async function getUserHistory() {
        try {
            const response = await fetch(`/history`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.accessToken}`
                }
            });
            if (response.ok) {
                const rescontent = await response.text()
                document.open();
                document.write(rescontent);
                document.close();
            }
            // See what you actually got back
            // const text = await response.text();
            // console.log("Raw response:", text);

            // // Try parsing JSON only if it's valid
            // try {
            //     const history = JSON.parse(text);
            //     console.log("User history:", history);
            //     return history;
            //     const homepageContent = await response.text();
            //     document.open();
            //     document.write(text);
            //     document.close();
            // } catch (err) {
            //     throw new Error("Response is not JSON. Probably HTML error page.");
            // }
        } catch (error) {
            console.error("Failed to fetch history:", error);
        }
    }


    getUserHistory()

}


function navigateToAbout() {
    console.log('Navigating to About');
    window.location.href = '/about';
}


async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        console.log('Logging out...');
        // Clear any stored user data
        localStorage.clear();
        sessionStorage.clear();
             

        // Redirect to login page

        window.location.href = '/';
    }
}
