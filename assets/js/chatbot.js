// PlacementBot - Chatbot Functionality

let chatHistory = [];

function addBotMessage(message) {
  const messagesContainer = document.getElementById('chatMessages');
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'chat-message';
  messageDiv.innerHTML = `
    <div class="chat-avatar">B</div>
    <div class="chat-bubble">${message}</div>
  `;
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addUserMessage(message) {
  const messagesContainer = document.getElementById('chatMessages');
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'chat-message user';
  messageDiv.innerHTML = `
    <div class="chat-avatar">U</div>
    <div class="chat-bubble">${message}</div>
  `;
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  // Add user message
  addUserMessage(message);
  chatHistory.push({ role: 'user', message });
  
  // Clear input
  input.value = '';
  
  // Process message and get response
  setTimeout(() => {
    const response = getBotResponse(message);
    addBotMessage(response);
    chatHistory.push({ role: 'bot', message: response });
  }, 500);
}

function getBotResponse(message) {
  const msg = message.toLowerCase();
  const session = Storage.getSession();
  
  // Get current user data
  let profile = null;
  let drives = [];
  let applications = [];
  
  if (session) {
    if (session.role === 'student') {
      profile = Storage.getProfileByUserId(session.userId);
      drives = Storage.getDrives();
      applications = Storage.getApplicationsByStudent(session.userId);
    }
  }
  
  // Greeting
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return `Hi${session ? ' ' + session.name : ''}! 👋 I'm PlacementBot. I can help you with:<br><br>• Check eligibility for drives<br>• Get cutoff information<br>• View upcoming interviews<br>• Answer placement queries<br><br>What would you like to know?`;
  }
  
  // Eligibility check
  if (msg.includes('eligible') || msg.includes('eligibility')) {
    if (!profile) {
      return 'Please complete your profile first to check eligibility for placement drives.';
    }
    
    const eligible = drives.filter(drive => 
      drive.minCGPA <= profile.cgpa &&
      drive.maxBacklogs >= profile.backlogs &&
      drive.branches.includes(profile.branch)
    );
    
    if (eligible.length === 0) {
      return 'Currently, there are no drives matching your profile. Keep improving your skills!';
    }
    
    return `You are eligible for <strong>${eligible.length} placement drives</strong>:<br><br>${
      eligible.slice(0, 3).map(d => `• ${d.company} - ${d.role}`).join('<br>')
    }${eligible.length > 3 ? '<br><br>...and more!' : ''}`;
  }
  
  // Cutoff information
  if (msg.includes('cutoff') || msg.includes('cgpa') || msg.includes('criteria')) {
    if (drives.length === 0) {
      return 'No placement drives are currently active.';
    }
    
    const cutoffs = drives.slice(0, 5).map(d => 
      `• <strong>${d.company}</strong>: Min CGPA ${d.minCGPA}, Max Backlogs ${d.maxBacklogs}`
    ).join('<br>');
    
    return `Here are the eligibility criteria for active drives:<br><br>${cutoffs}`;
  }
  
  // Interview information
  if (msg.includes('interview') || msg.includes('schedule') || msg.includes('when')) {
    if (!session || session.role !== 'student') {
      return 'Please login as a student to check your interview schedule.';
    }
    
    if (applications.length === 0) {
      return 'You haven\'t applied to any drives yet. Check the Opportunities section to apply!';
    }
    
    const shortlisted = applications.filter(a => a.status === 'Shortlisted');
    
    if (shortlisted.length === 0) {
      return `You have applied to ${applications.length} drives. Interview schedules will be shared once you're shortlisted.`;
    }
    
    const driveInfo = shortlisted.map(app => {
      const drive = Storage.getDriveById(app.driveId);
      return `• <strong>${drive.company}</strong> - ${drive.role}`;
    }).join('<br>');
    
    return `You're shortlisted for:<br><br>${driveInfo}<br><br>Interview details will be shared via email soon!`;
  }
  
  // Application status
  if (msg.includes('status') || msg.includes('application')) {
    if (!session || session.role !== 'student') {
      return 'Please login as a student to check application status.';
    }
    
    if (applications.length === 0) {
      return 'You haven\'t applied to any drives yet.';
    }
    
    const statusCount = {
      Applied: 0,
      Shortlisted: 0,
      Selected: 0,
      Rejected: 0
    };
    
    applications.forEach(app => {
      statusCount[app.status]++;
    });
    
    return `Your Application Status:<br><br>• Applied: ${statusCount.Applied}<br>• Shortlisted: ${statusCount.Shortlisted}<br>• Selected: ${statusCount.Selected}<br>• Rejected: ${statusCount.Rejected}`;
  }
  
  // Skills
  if (msg.includes('skill') || msg.includes('learn')) {
    return 'To improve your chances:<br><br>• Master Data Structures & Algorithms<br>• Learn popular frameworks (React, Node.js)<br>• Build projects for your portfolio<br>• Practice coding on LeetCode/HackerRank<br>• Improve communication skills<br><br>Check the Skill Gap Analysis in your profile for personalized recommendations!';
  }
  
  // Help
  if (msg.includes('help') || msg.includes('what can you')) {
    return 'I can help you with:<br><br>• <strong>"Am I eligible?"</strong> - Check eligibility<br>• <strong>"What is the cutoff?"</strong> - Get criteria info<br>• <strong>"When is my interview?"</strong> - Interview schedule<br>• <strong>"Application status"</strong> - Track applications<br>• <strong>"Skills to learn"</strong> - Get recommendations<br><br>Just ask me anything!';
  }
  
  // Default response
  return 'I\'m here to help with placement-related queries! Try asking:<br><br>• "Am I eligible for any drives?"<br>• "What is the cutoff?"<br>• "When is my interview?"<br>• "What skills should I learn?"<br><br>Or type "help" to see all options.';
}

// Initialize chatbot with welcome message
function initChatbot() {
  const session = Storage.getSession();
  if (session) {
    setTimeout(() => {
      addBotMessage(`Welcome back, ${session.name}! 👋 How can I help you today?`);
    }, 1000);
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatbot);
} else {
  initChatbot();
}