// TPO Dashboard Functionality

let session;
let charts = {};

// Initialize dashboard
function initTPODashboard() {
  session = checkAuth('tpo');
  if (!session) return;
  
  // Update user info
  const user = Storage.getUserById(session.userId);
  document.getElementById('userName').textContent = user.name;
  document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
  
  // Load overview data
  loadOverview();
  
  // Setup navigation
  setupNavigation();
  
  // Setup form listeners
  setupFormListeners();
}

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-page]');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const page = item.getAttribute('data-page');
      switchPage(page);
      
      // Update active state
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

function switchPage(page) {
  // Hide all sections
  document.querySelectorAll('.page-section').forEach(section => {
    section.classList.add('hidden');
  });
  
  // Show selected section
  const sectionMap = {
    'overview': 'overviewSection',
    'drives': 'drivesSection',
    'students': 'studentsSection',
    'analytics': 'analyticsSection'
  };
  
  const sectionId = sectionMap[page];
  document.getElementById(sectionId).classList.remove('hidden');
  
  // Update page title
  const titleMap = {
    'overview': 'TPO Dashboard',
    'drives': 'Placement Drives',
    'students': 'Student Management',
    'analytics': 'Analytics & Reports'
  };
  document.getElementById('pageTitle').textContent = titleMap[page];
  
  // Load page-specific data
  if (page === 'drives') loadDrives();
  if (page === 'students') loadStudents();
  if (page === 'analytics') loadAnalytics();
}

function loadOverview() {
  const students = Storage.getStudentProfiles();
  const drives = Storage.getDrives();
  const applications = Storage.getApplications();
  const placedStudents = applications.filter(a => a.status === 'Selected');
  
  // Update stats
  document.getElementById('totalStudents').textContent = students.length;
  document.getElementById('activeDrives').textContent = drives.length;
  document.getElementById('placedStudents').textContent = placedStudents.length;
  document.getElementById('totalApplications').textContent = applications.length;
  
  // Load recent drives table
  loadRecentDrives();
}

function loadRecentDrives() {
  const drives = Storage.getDrives().slice(0, 5);
  const applications = Storage.getApplications();
  const tbody = document.getElementById('recentDrivesTable');
  
  if (drives.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">No drives created yet</td></tr>';
    return;
  }
  
  tbody.innerHTML = drives.map(drive => {
    const driveApps = applications.filter(a => a.driveId === drive.id);
    return `
      <tr data-testid="drive-row-${drive.id}">
        <td><strong>${drive.company}</strong></td>
        <td>${drive.role}</td>
        <td>${drive.minCGPA}</td>
        <td>${driveApps.length}</td>
        <td><span class="badge badge-success">Active</span></td>
      </tr>
    `;
  }).join('');
}

function loadDrives() {
  const drives = Storage.getDrives();
  const applications = Storage.getApplications();
  const container = document.getElementById('drivesContainer');
  
  if (drives.length === 0) {
    container.innerHTML = '<div class="text-center" style="padding: 60px;"><h3>No placement drives yet</h3><p style="color: var(--text-secondary);">Create your first drive to get started</p></div>';
    return;
  }
  
  container.innerHTML = drives.map(drive => {
    const driveApps = applications.filter(a => a.driveId === drive.id);
    const eligibleCount = calculateEligibleStudents(drive);
    
    return `
      <div class="drive-card" data-testid="drive-${drive.id}">
        <div class="drive-header">
          <div>
            <div class="drive-company">${drive.company}</div>
            <div class="drive-role">${drive.role}</div>
          </div>
          <span class="badge badge-success">Active</span>
        </div>
        
        <div class="drive-meta">
          <div class="meta-item">
            <span>🎯</span>
            <span>Min CGPA: ${drive.minCGPA}</span>
          </div>
          <div class="meta-item">
            <span>📚</span>
            <span>Max Backlogs: ${drive.maxBacklogs}</span>
          </div>
          <div class="meta-item">
            <span>💰</span>
            <span>CTC: ${drive.ctc}</span>
          </div>
          <div class="meta-item">
            <span>📅</span>
            <span>Deadline: ${new Date(drive.deadline).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div class="drive-skills">
          ${drive.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>
        
        <p style="color: var(--text-secondary); margin-bottom: 16px;">${drive.description}</p>
        
        <div style="display: flex; gap: 12px; padding-top: 16px; border-top: 1px solid var(--border);">
          <div style="flex: 1;">
            <div style="font-size: 13px; color: var(--text-secondary);">Applications</div>
            <div style="font-size: 20px; font-weight: 700; color: var(--primary);">${driveApps.length}</div>
          </div>
          <div style="flex: 1;">
            <div style="font-size: 13px; color: var(--text-secondary);">Eligible</div>
            <div style="font-size: 20px; font-weight: 700; color: var(--success);">${eligibleCount}</div>
          </div>
          <div style="flex: 1;">
            <div style="font-size: 13px; color: var(--text-secondary);">Branches</div>
            <div style="font-size: 20px; font-weight: 700;">${drive.branches.length}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function loadStudents() {
  const profiles = Storage.getStudentProfiles();
  const applications = Storage.getApplications();
  const tbody = document.getElementById('studentsTable');
  
  if (profiles.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No student profiles found</td></tr>';
    return;
  }
  
  tbody.innerHTML = profiles.map(profile => {
    const user = Storage.getUserById(profile.userId);
    const studentApps = applications.filter(a => a.studentId === profile.userId);
    const isPlaced = studentApps.some(a => a.status === 'Selected');
    
    return `
      <tr data-testid="student-${profile.userId}">
        <td><strong>${user.name}</strong></td>
        <td>${profile.branch}</td>
        <td><span class="badge badge-info">${profile.cgpa}</span></td>
        <td><span class="badge ${profile.backlogs === 0 ? 'badge-success' : 'badge-warning'}">${profile.backlogs}</span></td>
        <td>${profile.skills.slice(0, 3).join(', ')}${profile.skills.length > 3 ? '...' : ''}</td>
        <td><span class="badge ${isPlaced ? 'badge-success' : 'badge-secondary'}">${isPlaced ? 'Placed' : 'Active'}</span></td>
      </tr>
    `;
  }).join('');
}

function loadAnalytics() {
  // Destroy existing charts
  Object.values(charts).forEach(chart => {
    if (chart) chart.destroy();
  });
  
  const applications = Storage.getApplications();
  const profiles = Storage.getStudentProfiles();
  const drives = Storage.getDrives();
  
  // Placement Statistics Chart
  const placementCtx = document.getElementById('placementChart').getContext('2d');
  charts.placement = new Chart(placementCtx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Placements',
        data: [5, 12, 18, 25, 32, 45],
        backgroundColor: 'rgba(37, 99, 235, 0.8)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
  
  // Department-wise Chart
  const branchCounts = {};
  profiles.forEach(p => {
    branchCounts[p.branch] = (branchCounts[p.branch] || 0) + 1;
  });
  
  const departmentCtx = document.getElementById('departmentChart').getContext('2d');
  charts.department = new Chart(departmentCtx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(branchCounts),
      datasets: [{
        data: Object.values(branchCounts),
        backgroundColor: [
          'rgba(37, 99, 235, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
  
  // Application Status Chart
  const statusCounts = {
    Applied: 0,
    Shortlisted: 0,
    Selected: 0,
    Rejected: 0
  };
  
  applications.forEach(app => {
    statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
  });
  
  const statusCtx = document.getElementById('statusChart').getContext('2d');
  charts.status = new Chart(statusCtx, {
    type: 'pie',
    data: {
      labels: Object.keys(statusCounts),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: [
          'rgba(37, 99, 235, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// Create Drive Modal Functions
function openCreateDriveModal() {
  document.getElementById('createDriveModal').classList.add('active');
}

function closeCreateDriveModal() {
  document.getElementById('createDriveModal').classList.remove('active');
  document.getElementById('createDriveForm').reset();
  document.getElementById('eligibleCount').textContent = '0';

const notifyBtn = document.getElementById('notifyBtn');
  if(notifyBtn) {
    notifyBtn.disabled = true;
    notifyBtn.classList.remove('btn-success');
    notifyBtn.classList.add('btn-primary');
    notifyBtn.textContent = "📢 Notify All Eligible";
  }
}

function setupFormListeners() {
  const form = document.getElementById('createDriveForm');
  const inputs = ['minCGPA', 'maxBacklogs', 'branches'];
  
  inputs.forEach(id => {
    const element = document.getElementById(id);
    element.addEventListener('input', updateEligibleCount);
  });
}

function updateEligibleCount() {
  const minCGPA = parseFloat(document.getElementById('minCGPA').value) || 0;
  const maxBacklogs = parseInt(document.getElementById('maxBacklogs').value) || 0;
  const branchesInput = document.getElementById('branches').value;
  const branches = branchesInput ? branchesInput.split(',').map(b => b.trim()).filter(b => b !== "") : [];
  
  const notifyBtn = document.getElementById('notifyBtn');
  const countDisplay = document.getElementById('eligibleCount');

  if (minCGPA === 0 || branches.length === 0) {
    countDisplay.textContent = '0';
    if(notifyBtn) notifyBtn.disabled = true;
    currentEligibleStudentIds = [];
    return;
  }

  const profiles = Storage.getStudentProfiles();
  
  // Filter and capture the IDs
  const eligibleStudents = profiles.filter(p => {
    return p.cgpa >= minCGPA &&
           p.backlogs <= maxBacklogs &&
           branches.includes(p.branch);
  });

  currentEligibleStudentIds = eligibleStudents.map(p => p.userId);
  countDisplay.textContent = currentEligibleStudentIds.length;
  
  if(notifyBtn) {
    notifyBtn.disabled = currentEligibleStudentIds.length === 0;
    notifyBtn.textContent = `📢 Notify ${currentEligibleStudentIds.length} Students`;
    // Reset color in case it was green from a previous click
    notifyBtn.classList.remove('btn-success');
    notifyBtn.classList.add('btn-primary');
  }
}
function calculateEligibleStudents(drive) {
  const profiles = Storage.getStudentProfiles();
  return profiles.filter(p => {
    return p.cgpa >= drive.minCGPA &&
           p.backlogs <= drive.maxBacklogs &&
           drive.branches.includes(p.branch);
  }).length;
}

async function createDrive() {
  const company = document.getElementById('companyName').value.trim();
  const role = document.getElementById('roleName').value.trim();
  const min_cgpa = parseFloat(document.getElementById('minCGPA').value);
  const max_backlogs = parseInt(document.getElementById('maxBacklogs').value);
  const branches = document.getElementById('branches').value.trim();
  const skills = document.getElementById('skills').value.trim();
  const ctc = document.getElementById('ctc').value.trim();
  const deadline = document.getElementById('deadline').value;
  const description = document.getElementById('description').value.trim();
  
  // Validation
  if (!company || !role || !branches || !skills || !ctc || !deadline || !description) {
    showMessage('Please fill all required fields', 'error');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:3000/api/drives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company, role, min_cgpa, max_backlogs, branches, skills, ctc, deadline, description
      })
    });
    
    if (response.ok) {
      showMessage('Drive created successfully!', 'success');
      closeCreateDriveModal();
      document.getElementById('createDriveForm').reset();
      
      // Update UI (You will update loadDrives to use fetch next)
      // loadDrives(); 
    } else {
      const data = await response.json();
      showMessage(data.error, 'error');
    }
  } catch (error) {
    showMessage('Server error while creating drive.', 'error');
  }
}

function toggleChatbot() {
  document.getElementById('chatbotWindow').classList.toggle('active');
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTPODashboard);
} else {
  initTPODashboard();
}
function notifyEligibleStudents() {
  if (currentEligibleStudentIds.length === 0) return;

  const btn = document.getElementById('notifyBtn');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner">⏳</span> Sending Notifications...`;

  // Simulating the notification process
  setTimeout(() => {
    console.log("Notifications dispatched to:", currentEligibleStudentIds);
    
    btn.classList.replace('btn-primary', 'btn-success');
    btn.textContent = "✅ Students Notified!";
    
    // Uses your existing showMessage function if available
    if (typeof showMessage === 'function') {
      showMessage(`Alerts sent to ${currentEligibleStudentIds.length} students!`, 'success');
    }
  }, 1500);
}