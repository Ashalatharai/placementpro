let session;

// Initialize dashboard
function initAlumniPortal() {
  session = checkAuth('alumni');
  if (!session) return;
  
  // Use session.name instead of Storage.getUserById to prevent crashes
  document.getElementById('userName').textContent = session.name;
  document.getElementById('userAvatar').textContent = session.name.charAt(0).toUpperCase();
  
  loadOverview();
  setupNavigation();
}

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-page]');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const page = item.getAttribute('data-page');
      switchPage(page);
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

function switchPage(page) {
  document.querySelectorAll('.page-section').forEach(section => {
    section.classList.add('hidden');
  });
  
  const sectionMap = {
    'overview': 'overviewSection',
    'referrals': 'referralsSection',
    'mentorship': 'mentorshipSection'
  };
  
  document.getElementById(sectionMap[page]).classList.remove('hidden');
  
  const titleMap = {
    'overview': 'Alumni Portal',
    'referrals': 'My Referrals',
    'mentorship': 'Mentorship Sessions'
  };
  document.getElementById('pageTitle').textContent = titleMap[page];
  
  if (page === 'referrals') loadMyReferrals();
  if (page === 'mentorship') loadMentorshipSessions();
}

async function loadOverview() {
  try {
    const [refRes, sessRes] = await Promise.all([
      fetch(`http://localhost:3000/api/referrals/alumni/${session.userId}`),
      fetch(`http://localhost:3000/api/mentorship/alumni/${session.userId}`)
    ]);
    
    const myReferrals = await refRes.json();
    const mySessions = await sessRes.json();
    const uniqueStudents = new Set(mySessions.map(s => s.student_id));
    
    document.getElementById('totalReferrals').textContent = myReferrals.length;
    document.getElementById('totalSessions').textContent = mySessions.length;
    document.getElementById('studentsHelped').textContent = uniqueStudents.size;
    
    const impactScore = (myReferrals.length * 10) + (mySessions.length * 15);
    document.getElementById('impactScore').textContent = impactScore;
  } catch (error) {
    console.error("Error loading overview:", error);
  }
}

async function loadMyReferrals() {
  const container = document.getElementById('myReferralsList');
  container.innerHTML = 'Loading...';
  
  try {
    const response = await fetch(`http://localhost:3000/api/referrals/alumni/${session.userId}`);
    const myReferrals = await response.json();
    
    if (myReferrals.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 60px;"><h3>No Referrals Posted</h3><p style="color: var(--text-secondary);">Start helping students by posting job referrals</p></div>';
      return;
    }
    
    container.innerHTML = myReferrals.map(ref => `
      <div class="drive-card">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
          <div>
            <div style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">${ref.company}</div>
            <div style="font-size: 16px; color: var(--text-secondary);">${ref.role}</div>
          </div>
          <span class="badge badge-success">Active</span>
        </div>
        <p style="color: var(--text-secondary); margin-bottom: 16px;">${ref.description}</p>
        <div style="font-size: 13px; color: var(--text-secondary);">
          Posted on ${new Date(ref.posted_at).toLocaleDateString()}
        </div>
      </div>
    `).join('');
  } catch (error) {
    container.innerHTML = 'Failed to load referrals.';
  }
}

async function loadMentorshipSessions() {
  const tbody = document.getElementById('sessionsTable');
  tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading...</td></tr>';
  
  try {
    const response = await fetch(`http://localhost:3000/api/mentorship/alumni/${session.userId}`);
    const sessions = await response.json();
    
    if (sessions.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">No mentorship sessions booked yet</td></tr>';
      return;
    }
    
    tbody.innerHTML = sessions.map(sess => {
      const statusClass = {
        'Pending': 'badge-warning',
        'Confirmed': 'badge-success',
        'Completed': 'badge-info',
        'Cancelled': 'badge-danger'
      };
      
      return `
        <tr>
          <td><strong>${sess.student_name}</strong></td>
          <td>${sess.topic}</td>
          <td>${new Date(sess.session_date).toLocaleDateString()} at ${sess.session_time}</td>
          <td><span class="badge ${statusClass[sess.status]}">${sess.status}</span></td>
          <td>
            ${sess.status === 'Pending' ? 
              `<button class="btn btn-success btn-sm" onclick="confirmSession(${sess.id})">Confirm</button>` :
              '<span style="color: var(--text-secondary); font-size: 13px;">-</span>'
            }
          </td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Failed to load sessions.</td></tr>';
  }
}

async function confirmSession(sessionId) {
  try {
    const response = await fetch(`http://localhost:3000/api/mentorship/${sessionId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Confirmed' })
    });
    
    if (response.ok) {
      showMessage('Session confirmed successfully!', 'success');
      loadMentorshipSessions();
      loadOverview();
    }
  } catch (error) {
    showMessage('Failed to confirm session.', 'error');
  }
}

function openPostReferralModal() {
  document.getElementById('postReferralModal').classList.add('active');
}

function closePostReferralModal() {
  document.getElementById('postReferralModal').classList.remove('active');
  document.getElementById('referralForm').reset();
}

async function postReferral() {
  const form = document.getElementById('referralForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const company = document.getElementById('refCompany').value.trim();
  const role = document.getElementById('refRole').value.trim();
  const description = document.getElementById('refDescription').value.trim();
  
  try {
    const response = await fetch('http://localhost:3000/api/referrals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alumniId: session.userId,
        contactEmail: session.email,
        company, role, description
      })
    });
    
    if (response.ok) {
      showMessage('Referral posted successfully!', 'success');
      closePostReferralModal();
      
      if (!document.getElementById('referralsSection').classList.contains('hidden')) {
        loadMyReferrals();
      }
      loadOverview();
    }
  } catch (error) {
    showMessage('Server error. Failed to post referral.', 'error');
  }
}

// Mobile sidebar logic and chatbot toggle
function toggleChatbot() { document.getElementById('chatbotWindow').classList.toggle('active'); }
function handleChatEnter(event) { if (event.key === 'Enter') sendMessage(); }

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAlumniPortal);
} else {
  initAlumniPortal();
}