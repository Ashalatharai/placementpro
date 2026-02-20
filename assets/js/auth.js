// Authentication Functions

function register(event) {
  event.preventDefault();
  
  const name = document.getElementById('name').value.trim();
  // FORCE LOWERCASE TO PREVENT LOGIN ERRORS
  const email = document.getElementById('email').value.trim().toLowerCase(); 
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;
  
  // Validation
  if (!name || !email || !password || !role) {
    showMessage('All fields are required', 'error');
    return;
  }
  
  if (password.length < 6) {
    showMessage('Password must be at least 6 characters', 'error');
    return;
  }
  
  // Check if user already exists
  const existingUser = Storage.getUserByEmail(email);
  if (existingUser) {
    showMessage('Email already registered', 'error');
    return;
  }
  
  // Create user
  const user = Storage.addUser({
    name,
    email,
    password, 
    role
  });
  
  // FIX: Redirect to the login page instead of auto-logging in
  showMessage('Registration successful! Please login...', 'success');
  
  setTimeout(() => {
    window.location.href = 'index.html'; 
  }, 1500);
}

function login(event) {
  event.preventDefault();
  
  // FORCE LOWERCASE TO MATCH REGISTRATION EXACTLY
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    showMessage('All fields are required', 'error');
    return;
  }
  
  const user = Storage.getUserByEmail(email);
  
  if (!user) {
    showMessage('User not found. Please check your email or register.', 'error');
    return;
  }
  
  if (user.password !== password) {
    showMessage('Invalid password', 'error');
    return;
  }
  
  // Set session
  Storage.setSession(user.id, user.role, user.name);
  showMessage('Login successful! Redirecting...', 'success');
  
  setTimeout(() => {
    redirectToDashboard(user.role);
  }, 500);
}

function logout() {
  Storage.clearSession();
  window.location.href = 'index.html';
}

function redirectToDashboard(role) {
  const dashboardMap = {
    'tpo': 'tpo.html',
    'student': 'student.html',
    'alumni': 'alumni.html'
  };
  
  window.location.href = dashboardMap[role] || 'index.html';
}

function checkAuth(requiredRole = null) {
  const session = Storage.getSession();
  
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  
  if (requiredRole && session.role !== requiredRole) {
    window.location.href = 'index.html';
    return null;
  }
  
  return session;
}

function showMessage(message, type = 'info') {
  // Create message element
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 8px;
    font-weight: 500;
    z-index: 10000;
    animation: slideIn 0.3s ease;
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  `;
  
  if (type === 'success') {
    messageDiv.style.background = '#10b981';
    messageDiv.style.color = 'white';
  } else if (type === 'error') {
    messageDiv.style.background = '#ef4444';
    messageDiv.style.color = 'white';
  } else {
    messageDiv.style.background = '#3b82f6';
    messageDiv.style.color = 'white';
  }
  
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    messageDiv.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => messageDiv.remove(), 300);
  }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// --- Forgot Password Features ---

function openForgotPasswordModal() {
  document.getElementById('forgotPasswordModal').style.display = 'flex';
}

function closeForgotPasswordModal() {
  document.getElementById('forgotPasswordModal').style.display = 'none';
  document.getElementById('resetEmail').value = '';
  document.getElementById('newPassword').value = '';
}

function handlePasswordReset(event) {
  event.preventDefault();
  
  const email = document.getElementById('resetEmail').value.trim().toLowerCase();
  const newPassword = document.getElementById('newPassword').value;

  // 1. Validation
  if (newPassword.length < 6) {
    showMessage('New password must be at least 6 characters', 'error');
    return;
  }

  // 2. Check if the user exists
  const user = Storage.getUserByEmail(email);
  if (!user) {
    showMessage('No account found with that email address.', 'error');
    return;
  }

  // 3. Update the password in storage
  Storage.updateUser(user.id, { password: newPassword });
  
  // 4. Clean up and notify user
  showMessage('Password reset successfully! You can now login.', 'success');
  closeForgotPasswordModal();
}