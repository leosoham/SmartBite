// Form validation and handling
document.addEventListener('DOMContentLoaded', function() {
    // Login form handling
    // const loginForm = document.getElementById('loginForm');
    // if (loginForm) {
    //     loginForm.addEventListener('submit', function(e) {
    //         e.preventDefault();
    //         // handleLogin();
    //     });
    // }
    
    // Sign in form handling
    const signinForm = document.getElementById('signinForm');
    if (signinForm) {
        signinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSignin();
        });
    }
});

// function handleLogin() {
//     const username = document.getElementById('username').value;
//     const password = document.getElementById('password').value;
    
//     // Basic validation
//     if (!username || !password) {
//         alert('Please fill in all fields');
//         return;
//     }
    
//     // Here you'll integrate with your authentication API
//     console.log('Login attempt:', { username, password });
    
//     // Placeholder success message
//     alert('Login successful! (This will redirect to dashboard)');
    
//     // TODO: Redirect to dashboard after successful authentication
//     // window.location.href = 'dashboard.html';
// }

function handleSignin() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('createPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Basic validation
    if (!firstName || !lastName || !username || !password || !confirmPassword) {
        // alert('Please fill in all fields');
        return;
    }
    
    // Password confirmation check
    if (password !== confirmPassword) {
        // alert('Passwords do not match');
        return;
    }
    
    // Password strength check (basic)
    if (password.length < 6) {
        // alert('Password must be at least 6 characters long');
        return;
    }
    
    // Here you'll integrate with your registration API
    console.log('Sign up attempt:', { firstName, lastName, username, password });
    
    // Placeholder success message
    // alert('Account created successfully! Please login.');
    
    // Redirect to login page
    // window.location.href = '/';
}

// Logo upload functionality (for when you get your logo)
function updateLogo(logoPath) {
    const logoImg = document.getElementById('logo');
    const logoPlaceholder = document.querySelector('.logo-placeholder');
    
    if (logoImg && logoPlaceholder) {
        logoImg.src = logoPath;
        logoImg.style.display = 'block';
        logoPlaceholder.style.display = 'none';
    }
}
