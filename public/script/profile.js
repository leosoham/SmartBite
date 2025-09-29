// Profile page functionality
let isEditing = false;
let originalValues = {};

// Add loading state variables
let isLoading = false;
let loadingAttempts = 0;
const MAX_LOADING_ATTEMPTS = 3;

document.addEventListener('DOMContentLoaded', function() {
    // Show loading state
    showLoadingState();
    // Load user data from backend
    loadUserData();
});

// Back button functionality
function goBackToHomepage() {
    if (isEditing) {
        if (confirm('You have unsaved changes. Are you sure you want to go back?')) {
            window.location.href = '/home';
        }
    } else {
        window.location.href = '/home';
    }
}

// Show loading state
function showLoadingState() {
    isLoading = true;
    // Disable all input fields and buttons
    const fields = ['firstName', 'lastName', 'username', 'password'];
    fields.forEach(id => {
        const field = document.getElementById(id);
        field.setAttribute('readonly', true);
        field.classList.add('loading');
        field.value = 'Loading...';
    });
    
    // Disable edit buttons
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(btn => {
        btn.disabled = true;
    });
    
    // Update avatar
    const avatarText = document.getElementById('avatarText');
    avatarText.textContent = '⟳';
    avatarText.classList.add('loading-spin');
}

// Hide loading state
function hideLoadingState() {
    isLoading = false;
    // Re-enable edit buttons
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(btn => {
        btn.disabled = false;
    });
    
    // Remove loading class from fields
    const fields = ['firstName', 'lastName', 'username', 'password'];
    fields.forEach(id => {
        const field = document.getElementById(id);
        field.classList.remove('loading');
    });
    
    // Remove loading animation from avatar
    const avatarText = document.getElementById('avatarText');
    avatarText.classList.remove('loading-spin');
}

// Load user data from backend
async function loadUserData() {
    loadingAttempts++;
    isLoading = true;
    
    try {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');
        
        if (!user || !token) {
            console.error('Missing user or token');
            setDefaultUserData();
            return;
        }
        
        console.log("Loading data for user: " + user);
        
        const response = await fetch(`/info?user=${encodeURIComponent(user)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            // Add timeout to prevent hanging requests
            signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        if (!response.ok) {
            console.error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
            throw new Error(`Failed to fetch user data: ${response.status}`);
        }
        
        const userData = await response.json();
        console.log("User data loaded:", userData);
        
        if (!userData || !userData.username) {
            console.error('Invalid user data received');
            throw new Error('Invalid user data');
        }
        
        // Populate fields
        document.getElementById('firstName').value = userData.firstName || 'User';
        document.getElementById('lastName').value = userData.lastName || '';
        document.getElementById('username').value = userData.username || '';
        document.getElementById('password').value = '********';
        
        // Update avatar
        updateAvatar();
        
        // Reset loading state
        hideLoadingState();
        loadingAttempts = 0;
        
    } catch (error) {
        console.error('Error loading user data:', error);
        
        // If we haven't exceeded max attempts, try again
        if (loadingAttempts < MAX_LOADING_ATTEMPTS) {
            console.log(`Retrying load (attempt ${loadingAttempts + 1} of ${MAX_LOADING_ATTEMPTS})...`);
            setTimeout(loadUserData, 1000); // Wait 1 second before retrying
        } else {
            // Max attempts reached, show default data
            console.warn('Max loading attempts reached, using default data');
            setDefaultUserData();
        }
    }
}

// Set default user data when loading fails
function setDefaultUserData() {
    // Get username from localStorage at minimum
    const username = localStorage.getItem('user') || 'User';
    
    // Set minimal data
    document.getElementById('firstName').value = 'User';
    document.getElementById('lastName').value = '';
    document.getElementById('username').value = username;
    document.getElementById('password').value = '********';
    
    // Update avatar
    updateAvatar();
    
    // Hide loading state
    hideLoadingState();
}

// Update avatar with first letter of first name
function updateAvatar() {
   const firstName = document.getElementById('firstName').value;
    const avatarText = document.getElementById('avatarText');
    avatarText.textContent = firstName ? firstName.charAt(0).toUpperCase() : 'U';
}

// Toggle password visibility with custom icons
function togglePassword() {
    const passwordField = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        eyeIcon.src = 'eye-off.png'; // Change to closed eye icon
        eyeIcon.alt = 'Hide Password';
    } else {
        passwordField.type = 'password';
        eyeIcon.src = 'eye.png'; // Change back to open eye icon
        eyeIcon.alt = 'Show Password';
    }
}


// Edit field functionality
function editField(fieldId) {
    if (!isEditing) {
        // Store original values
        originalValues = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        };
        
        isEditing = true;
        
        // Make all fields editable
        const fields = ['firstName', 'lastName', 'username', 'password'];
        fields.forEach(id => {
            const field = document.getElementById(id);
            field.removeAttribute('readonly');
            field.style.backgroundColor = '#ffffff';
        });
        
        // Show action buttons
        document.getElementById('actionButtons').style.display = 'flex';
        
        // Focus on the clicked field
        document.getElementById(fieldId).focus();
    }
}

async function updateUser(original, user, rname) {
  try {
    const response = await fetch("/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.accessToken}` // token from login
      },
      body: JSON.stringify({
        original: original,
        user: user,
        rname: rname
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Updated user:", data);
    return data;
  } catch (err) {
    console.error("❌ Error updating user:", err);
  }
}


// Save changes
async function saveChanges() {
    // Get current values
    const userData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        username: document.getElementById('username').value.trim(),
        password: document.getElementById('password').value
    };
    
    // Validate fields
    if (!userData.firstName || !userData.lastName || !userData.username || !userData.password) {
        alert('Please fill in all fields');
        return;
    }
    
    if (userData.username.length < 3) {
        alert('Username must be at least 3 characters long');
        return;
    }
    
    if (userData.password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
     
    const realName = `${userData.firstName} ${userData.lastName}`
    const original = localStorage.user
    const userChange = userData.username
    try {
        updateUser(original,userChange, realName)
    } catch (error) {
        console.log(error)
    }
    
    localStorage.user = userChange


    
    // Here you would send the data to your backend
    console.log('Saving user data:', userData);
    
    // Simulate API call
    setTimeout(() => {
        alert('Profile updated successfully!');
        
        // Update avatar
        updateAvatar();
        
        // Exit edit mode
        exitEditMode();
    }, 500);
}

// Cancel edit
function cancelEdit() {
    if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
        // Restore original values
        document.getElementById('firstName').value = originalValues.firstName;
        document.getElementById('lastName').value = originalValues.lastName;
        document.getElementById('username').value = originalValues.username;
        document.getElementById('password').value = originalValues.password;
        
        exitEditMode();
    }
}

// Exit edit mode
function exitEditMode() {
    isEditing = false;
    
    // Make fields readonly again
    const fields = ['firstName', 'lastName', 'username', 'password'];
    fields.forEach(id => {
        const field = document.getElementById(id);
        field.setAttribute('readonly', true);
        field.style.backgroundColor = '#f8f8f8';
    });
    
    // Hide action buttons
    document.getElementById('actionButtons').style.display = 'none';
    
    // Reset password field type
    document.getElementById('password').type = 'password';
    document.getElementById('eyeBtn').textContent = '👁️';
}
