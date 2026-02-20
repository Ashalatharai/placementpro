// Student Portal Functionality

let session;
let studentProfile;

// Initialize dashboard
// Initialize dashboard
function initStudentPortal() {
  session = checkAuth('student');
  if (!session) return;
  
  // FIX 1: Use session.name directly since MySQL users aren't in LocalStorage
  document.getElementById('userName').textContent = session.name;
  document.getElementById('userAvatar').textContent = session.name.charAt(0).toUpperCase();
  
  // Load student profile
  loadProfile();
  
  // Setup navigation
  setupNavigation();
  
  // Setup form handlers
  setupForms();

  // FIX 2: Force the profile section to show immediately on load
  switchPage('profile');
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
    'profile': 'profileSection',
    'opportunities': 'opportunitiesSection',
    'applications': 'applicationsSection',
    'referrals': 'referralsSection',
    'mentorship': 'mentorshipSection',
    'resume': 'resumeSection'        // <-- ADD THIS LINE
  };
  
  const sectionId = sectionMap[page];
  
  // Safety check to prevent crashing if a section is missing
  if (!sectionId || !document.getElementById(sectionId)) {
      console.error("Section not found for page:", page);
      return; 
  }
  
  document.getElementById(sectionId).classList.remove('hidden');
  
  // Update page title
  const titleMap = {
    'profile': 'My Profile',
    'opportunities': 'Placement Opportunities',
    'applications': 'My Applications',
    'referrals': 'Job Referrals',
    'mentorship': 'Mentorship',
    'resume': 'Resume Builder'       // <-- ADD THIS LINE
  };
  document.getElementById('pageTitle').textContent = titleMap[page];
  
  // Load page-specific data
  if (page === 'opportunities') loadOpportunities();
  if (page === 'applications') loadApplications();
  if (page === 'referrals') loadReferrals();
  if (page === 'mentorship') loadMentorship();
}

function loadProfile() {
  studentProfile = Storage.getProfileByUserId(session.userId);
  
  if (studentProfile) {
    // Fill form with existing data
    document.getElementById('cgpa').value = studentProfile.cgpa;
    document.getElementById('branch').value = studentProfile.branch;
    document.getElementById('backlogs').value = studentProfile.backlogs;
    document.getElementById('phone').value = studentProfile.phone || '';
    document.getElementById('skills').value = studentProfile.skills.join(', ');
    document.getElementById('resume').value = studentProfile.resume || '';
    
    document.getElementById('profileStatus').textContent = 'Profile Complete';
    document.getElementById('profileStatus').className = 'badge badge-success';
    
    // Show skill gap analysis
    document.getElementById('skillGapSection').classList.remove('hidden');
    loadSkillGapAnalysis();
  }
}

function setupForms() {
  // Profile form
  document.getElementById('profileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveProfile();
  });
  
  // Mentorship form
  document.getElementById('mentorshipForm').addEventListener('submit', (e) => {
    e.preventDefault();
    bookMentorship();
  });
}

function saveProfile() {
  const profile = {
    userId: session.userId,
    cgpa: parseFloat(document.getElementById('cgpa').value),
    branch: document.getElementById('branch').value,
    backlogs: parseInt(document.getElementById('backlogs').value),
    phone: document.getElementById('phone').value.trim(),
    skills: document.getElementById('skills').value.split(',').map(s => s.trim()),
    resume: document.getElementById('resume').value.trim()
  };
  
  Storage.addOrUpdateProfile(profile);
  studentProfile = profile;
  
  showMessage('Profile saved successfully!', 'success');
  document.getElementById('profileStatus').textContent = 'Profile Complete';
  document.getElementById('profileStatus').className = 'badge badge-success';
  
  // Show skill gap analysis
  document.getElementById('skillGapSection').classList.remove('hidden');
  loadSkillGapAnalysis();
}

function loadSkillGapAnalysis() {
  if (!studentProfile) return;
  
  const drives = Storage.getDrives();
  const allRequiredSkills = new Set();
  
  // Get eligible drives and their required skills
  const eligibleDrives = drives.filter(drive => 
    studentProfile.cgpa >= drive.minCGPA &&
    studentProfile.backlogs <= drive.maxBacklogs &&
    drive.branches.includes(studentProfile.branch)
  );
  
  eligibleDrives.forEach(drive => {
    drive.skills.forEach(skill => allRequiredSkills.add(skill));
  });
  
  const mySkills = studentProfile.skills.map(s => s.toLowerCase());
  const requiredSkills = Array.from(allRequiredSkills);
  
  const matchingSkills = requiredSkills.filter(skill => 
    mySkills.some(mySkill => mySkill.toLowerCase() === skill.toLowerCase())
  );
  
  const missingSkills = requiredSkills.filter(skill => 
    !mySkills.some(mySkill => mySkill.toLowerCase() === skill.toLowerCase())
  );
  
  const content = document.getElementById('skillGapContent');
  
  if (eligibleDrives.length === 0) {
    content.innerHTML = '<p style="color: var(--text-secondary);">No placement drives match your current profile. Update your profile to see relevant opportunities.</p>';
    return;
  }
  
  content.innerHTML = `
    <div class="skill-comparison">
      <div class="skill-section">
        <h4>✅ Skills You Have</h4>
        <div class="skill-list">
          ${matchingSkills.length > 0 ? 
            matchingSkills.map(skill => `<span class="skill-item present">${skill}</span>`).join('') :
            '<p style="color: var(--text-secondary); font-size: 14px;">No matching skills found</p>'
          }
        </div>
      </div>
      
      <div class="skill-section">
        <h4>❌ Skills to Learn</h4>
        <div class="skill-list">
          ${missingSkills.length > 0 ? 
            missingSkills.map(skill => `<span class="skill-item missing">${skill}</span>`).join('') :
            '<p style="color: var(--success); font-size: 14px;">Great! You have all required skills</p>'
          }
        </div>
      </div>
    </div>
    
    <div class="mt-3" style="padding: 16px; background: rgba(37, 99, 235, 0.05); border-radius: 8px;">
      <strong style="color: var(--primary);">Recommendation:</strong>
      <p style="color: var(--text-secondary); margin-top: 8px; font-size: 14px;">
        ${missingSkills.length > 0 ? 
          `Focus on learning ${missingSkills.slice(0, 3).join(', ')} to increase your chances in ${eligibleDrives.length} eligible drives.` :
          `Excellent! You have all the skills required for ${eligibleDrives.length} eligible drives. Start applying now!`
        }
      </p>
    </div>
  `;
}

async function loadOpportunities() {
  if (!studentProfile) {
    document.getElementById('driveFeed').innerHTML = `
      <div style="text-align: center; padding: 60px;">
        <h3>Complete Your Profile First</h3>
        <p style="color: var(--text-secondary); margin: 16px 0;">Please complete your profile to see eligible placement drives</p>
        <button class="btn btn-primary" onclick="switchPage('profile'); document.querySelector('[data-page=profile]').click();">Go to Profile</button>
      </div>
    `;
    return;
  }
  
  try {
    // 1. Fetch ALL live drives from MySQL
    const drivesRes = await fetch('http://localhost:3000/api/drives');
    const drives = await drivesRes.json();

    // 2. Fetch the student's existing applications
    const appsRes = await fetch(`http://localhost:3000/api/applications/student/${session.userId}`);
    const applications = await appsRes.json();
    
    // Create an array of IDs the student has already applied to
    const appliedDriveIds = applications.map(app => app.drive_id);

    // 3. Filter drives based on eligibility rules
    const eligibleDrives = drives.filter(drive => {
      // Branches in MySQL are comma-separated strings (e.g., "Computer Science, IT")
      const allowedBranches = drive.branches.toLowerCase();
      const studentBranch = studentProfile.branch.toLowerCase();
      
      return drive.min_cgpa <= studentProfile.cgpa &&
             drive.max_backlogs >= studentProfile.backlogs &&
             allowedBranches.includes(studentBranch);
    });
    
    // Update dashboard stat numbers
    document.getElementById('eligibleDrives').textContent = eligibleDrives.length;
    document.getElementById('totalDrives').textContent = drives.length;
    document.getElementById('appliedCount').textContent = applications.length;
    
    const feed = document.getElementById('driveFeed');
    
    if (eligibleDrives.length === 0) {
      feed.innerHTML = '<div style="text-align: center; padding: 60px;"><h3>No Eligible Drives</h3><p style="color: var(--text-secondary);">Check back later for new opportunities</p></div>';
      return;
    }
    
    // 4. Render the HTML for each eligible drive
    feed.innerHTML = eligibleDrives.map(drive => {
      const hasApplied = appliedDriveIds.includes(drive.id);
      const daysLeft = Math.ceil((new Date(drive.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      
      // Convert skills string back to array for tags
      const driveSkills = drive.skills ? drive.skills.split(',').map(s => s.trim()) : [];
      
      return `
        <div class="drive-card" data-testid="drive-${drive.id}">
          <div class="drive-header">
            <div>
              <div class="drive-company">${drive.company}</div>
              <div class="drive-role">${drive.role}</div>
            </div>
            ${hasApplied ? 
              '<span class="badge badge-success">Applied</span>' : 
              '<span class="badge badge-info">Eligible</span>'
            }
          </div>
          
          <div class="drive-meta">
            <div class="meta-item"><span>🎯</span><span>Min CGPA: ${drive.min_cgpa}</span></div>
            <div class="meta-item"><span>📚</span><span>Max Backlogs: ${drive.max_backlogs}</span></div>
            <div class="meta-item"><span>💰</span><span>CTC: ${drive.ctc}</span></div>
            <div class="meta-item"><span>⏰</span><span class="${daysLeft <= 3 ? 'text-danger' : ''}">${daysLeft > 0 ? daysLeft + ' days left' : 'Closed'}</span></div>
          </div>
          
          <div class="drive-skills">
            ${driveSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
          
          <p style="color: var(--text-secondary); margin: 16px 0;">${drive.description}</p>
          
          <div class="drive-actions">
            ${hasApplied ? 
              '<button class="btn btn-secondary btn-sm" disabled>Already Applied</button>' :
              `<button class="btn btn-primary btn-sm" onclick="applyToDrive(${drive.id})">Apply Now</button>`
            }
          </div>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error("Error loading opportunities:", error);
    showMessage("Failed to load drives from server.", "error");
  }
}
async function applyToDrive(driveId) {
  if (!studentProfile) {
    showMessage('Please complete your profile first', 'error');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:3000/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        studentId: session.userId, 
        driveId: driveId 
      })
    });
    
    if (response.ok) {
      showMessage('Application submitted successfully!', 'success');
      // Refresh the UI to show the "Applied" badge
      loadOpportunities();
      loadApplications();
    } else {
      const data = await response.json();
      showMessage(data.error, 'error');
    }
  } catch (error) {
    console.error("Error applying:", error);
    showMessage('Server error. Could not submit application.', 'error');
  }
}
function showSkillMatch(driveId) {
  const drive = Storage.getDriveById(driveId);
  const mySkills = studentProfile.skills.map(s => s.toLowerCase());
  
  const matchingSkills = drive.skills.filter(skill => 
    mySkills.some(mySkill => mySkill.toLowerCase() === skill.toLowerCase())
  );
  
  const missingSkills = drive.skills.filter(skill => 
    !mySkills.some(mySkill => mySkill.toLowerCase() === skill.toLowerCase())
  );
  
  const matchPercentage = Math.round((matchingSkills.length / drive.skills.length) * 100);
  
  alert(`Skill Match: ${matchPercentage}%\n\nMatching Skills: ${matchingSkills.join(', ') || 'None'}\n\nMissing Skills: ${missingSkills.join(', ') || 'None'}`);
}

async function loadApplications() {
  const tbody = document.getElementById('applicationsTable');
  tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px;">Loading applications...</td></tr>';
  
  try {
    const response = await fetch(`http://localhost:3000/api/applications/student/${session.userId}`);
    const applications = await response.json();
    
    if (applications.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px;">No applications yet</td></tr>';
      return;
    }
    
    tbody.innerHTML = applications.map(app => {
      const statusClass = {
        'Applied': 'badge-info',
        'Shortlisted': 'badge-warning',
        'Selected': 'badge-success',
        'Rejected': 'badge-danger'
      };
      
      // Because we used a JOIN query in our server, we have company and role details!
      return `
        <tr>
          <td><strong>${app.company}</strong></td>
          <td>${app.role}</td>
          <td>${new Date(app.applied_at).toLocaleDateString()}</td>
          <td><span class="badge ${statusClass[app.status]}">${app.status}</span></td>
        </tr>
      `;
    }).join('');
    
  } catch (error) {
    console.error("Error loading applications:", error);
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px; color: red;">Failed to load applications</td></tr>';
  }
}
function viewDriveDetails(driveId) {
  const drive = Storage.getDriveById(driveId);
  alert(`${drive.company} - ${drive.role}\n\nCTC: ${drive.ctc}\nMin CGPA: ${drive.minCGPA}\nMax Backlogs: ${drive.maxBacklogs}\n\nRequired Skills:\n${drive.skills.join(', ')}\n\nDescription:\n${drive.description}`);
}

async function loadReferrals() {
  const container = document.getElementById('referralsList');
  container.innerHTML = '<div style="text-align: center; padding: 40px;">Loading referrals...</div>';
  
  try {
    const response = await fetch('http://localhost:3000/api/referrals');
    const referrals = await response.json();
    
    if (referrals.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 60px;"><h3>No Referrals Available</h3><p style="color: var(--text-secondary);">Check back later for job referrals from alumni</p></div>';
      return;
    }
    
    container.innerHTML = referrals.map(ref => `
      <div class="drive-card">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
          <div>
            <div style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">${ref.company}</div>
            <div style="font-size: 16px; color: var(--text-secondary);">${ref.role}</div>
          </div>
          <span class="badge badge-info">Referral</span>
        </div>
        
        <p style="color: var(--text-secondary); margin-bottom: 16px;">${ref.description}</p>
        
        <div style="display: flex; align-items: center; gap: 12px; padding-top: 16px; border-top: 1px solid var(--border);">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600;">
            ${ref.alumni_name.charAt(0)}
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 600; color: var(--text-primary);">${ref.alumni_name}</div>
            <div style="font-size: 13px; color: var(--text-secondary);">Alumni</div>
          </div>
          <a href="mailto:${ref.contact_email}" class="btn btn-primary btn-sm">Contact</a>
        </div>
      </div>
    `).join('');
  } catch (error) {
    container.innerHTML = '<div style="text-align: center; color: red;">Failed to load referrals.</div>';
  }
}
function generateResume() {
  // 1. Ensure the student has completed their profile
  if (!studentProfile) {
    showMessage("Please complete and save your profile first before generating a resume.", "error");
    document.querySelector('[data-page="profile"]').click(); 
    return;
  }

  // 2. Fetch the user details and form inputs
  const user = Storage.getUserById(session.userId);
  const projectsInput = document.getElementById('resInputProjects').value.trim();
  const certsInput = document.getElementById('resInputCerts').value.trim();
  const achievementsInput = document.getElementById('resInputAchievements').value.trim();

  // 3. Auto-Generate the Professional Summary based on their skills
  const branch = studentProfile.branch || 'Engineering';
  // Grab up to the first 3 skills they listed to highlight in the summary
  const topSkills = studentProfile.skills.slice(0, 3).join(', ');
  
  const autoSummary = `Highly motivated and results-driven ${branch} student with a strong foundation in ${topSkills}. Proven ability to apply technical knowledge to practical projects. Eager to leverage academic background and hands-on skills to contribute effectively to a dynamic technical team.`;
  
  document.getElementById('resSummary').textContent = autoSummary;

  // 4. Populate basic profile data
  document.getElementById('resName').textContent = user.name;
  document.getElementById('resEmail').textContent = user.email;
  document.getElementById('resPhone').textContent = studentProfile.phone || 'N/A';
  document.getElementById('resBranch').textContent = studentProfile.branch;
  document.getElementById('resCgpa').textContent = studentProfile.cgpa;
  document.getElementById('resBacklogs').textContent = studentProfile.backlogs;
  
  const formattedSkills = studentProfile.skills.join(' • ');
  document.getElementById('resSkills').textContent = formattedSkills;

  // 5. Helper function to format textareas into bullet points
  const populateList = (inputText, sectionId, listId) => {
    if (inputText) {
      // Split text by new lines and ignore empty lines
      const items = inputText.split('\n').filter(item => item.trim() !== '');
      const listElement = document.getElementById(listId);
      // Map each line to an HTML bullet point
      listElement.innerHTML = items.map(item => `<li>${item.trim()}</li>`).join('');
      document.getElementById(sectionId).style.display = 'block'; // Show section
    } else {
      document.getElementById(sectionId).style.display = 'none'; // Hide if empty
    }
  };

  // 6. Build the dynamic lists
  populateList(projectsInput, 'resSectionProjects', 'resProjects');
  populateList(certsInput, 'resSectionCerts', 'resCerts');
  populateList(achievementsInput, 'resSectionAchievements', 'resAchievements');

  // 7. Hide the empty state and show the generated resume
  document.getElementById('resumeEmptyState').style.display = 'none';
  document.getElementById('resumePreview').style.display = 'block';
}

async function loadMentorship() {
  const select = document.getElementById('alumniSelect');
  const tbody = document.getElementById('bookingsTable');
  
  try {
    // 1. Fetch live list of Alumni from MySQL
    const alumniRes = await fetch('http://localhost:3000/api/alumni');
    const alumni = await alumniRes.json();
    
    select.innerHTML = '<option value="">Choose a mentor</option>' + 
      alumni.map(alum => `<option value="${alum.id}">${alum.name}</option>`).join('');
    
    // 2. Fetch the student's bookings
    const bookingsRes = await fetch(`http://localhost:3000/api/mentorship/student/${session.userId}`);
    const bookings = await bookingsRes.json();
    
    if (bookings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px;">No bookings yet</td></tr>';
      return;
    }
    
    tbody.innerHTML = bookings.map(booking => {
      const statusClass = {
        'Pending': 'badge-warning',
        'Confirmed': 'badge-success',
        'Completed': 'badge-info',
        'Cancelled': 'badge-danger'
      };
      
      return `
        <tr>
          <td><strong>${booking.alumni_name}</strong></td>
          <td>${booking.topic}</td>
          <td>${new Date(booking.session_date).toLocaleDateString()} at ${booking.session_time}</td>
          <td><span class="badge ${statusClass[booking.status] || 'badge-secondary'}">${booking.status}</span></td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    console.error("Error loading mentorships:", error);
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Failed to load mentorships</td></tr>';
  }
}

async function bookMentorship() {
  const alumniId = document.getElementById('alumniSelect').value;
  const sessionDate = document.getElementById('sessionDate').value;
  const sessionTime = document.getElementById('sessionTime').value;
  const topic = document.getElementById('sessionTopic').value.trim();
  
  if (!alumniId || !sessionDate || !sessionTime || !topic) {
    showMessage('Please fill all fields', 'error');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:3000/api/mentorship', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: session.userId,
        alumniId: alumniId,
        topic: topic,
        sessionDate: sessionDate,
        sessionTime: sessionTime
      })
    });
    
    if (response.ok) {
      showMessage('Mentorship session booked successfully!', 'success');
      document.getElementById('mentorshipForm').reset();
      loadMentorship(); // Refresh the table
    } else {
      showMessage('Failed to book session.', 'error');
    }
  } catch (error) {
    showMessage('Server error while booking.', 'error');
  }
}

function toggleChatbot() {
  document.getElementById('chatbotWindow').classList.toggle('active');
}

function handleChatEnter(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStudentPortal);
} else {
  initStudentPortal();
}