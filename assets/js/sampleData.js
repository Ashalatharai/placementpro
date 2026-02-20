// Sample Data Generator

function generateSampleData() {
  // Check if data already exists
  if (Storage.getUsers().length > 0) {
    console.log('Sample data already exists');
    return;
  }
  
  console.log('Generating sample data...');
  
  // Sample Users
  const users = [
    // TPO
    {
      name: 'Dr. Rajesh Kumar',
      email: 'tpo@college.edu',
      password: 'tpo123',
      role: 'tpo'
    },
    // Students
    {
      name: 'Priya Sharma',
      email: 'priya@student.edu',
      password: 'student123',
      role: 'student'
    },
    {
      name: 'Amit Patel',
      email: 'amit@student.edu',
      password: 'student123',
      role: 'student'
    },
    {
      name: 'Sneha Reddy',
      email: 'sneha@student.edu',
      password: 'student123',
      role: 'student'
    },
    {
      name: 'Rahul Verma',
      email: 'rahul@student.edu',
      password: 'student123',
      role: 'student'
    },
    {
      name: 'Neha Singh',
      email: 'neha@student.edu',
      password: 'student123',
      role: 'student'
    },
    // Alumni
    {
      name: 'Arjun Mehta',
      email: 'arjun@alumni.edu',
      password: 'alumni123',
      role: 'alumni'
    },
    {
      name: 'Kavya Krishnan',
      email: 'kavya@alumni.edu',
      password: 'alumni123',
      role: 'alumni'
    }
  ];
  
  const createdUsers = users.map(user => Storage.addUser(user));
  
  // Sample Student Profiles
  const studentUsers = createdUsers.filter(u => u.role === 'student');
  const studentProfiles = [
    {
      userId: studentUsers[0].id,
      cgpa: 8.5,
      branch: 'Computer Science',
      backlogs: 0,
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB'],
      resume: 'priya_resume.pdf',
      phone: '+91 9876543210'
    },
    {
      userId: studentUsers[1].id,
      cgpa: 7.8,
      branch: 'Information Technology',
      backlogs: 1,
      skills: ['Java', 'Spring Boot', 'MySQL', 'AWS'],
      resume: 'amit_resume.pdf',
      phone: '+91 9876543211'
    },
    {
      userId: studentUsers[2].id,
      cgpa: 9.1,
      branch: 'Computer Science',
      backlogs: 0,
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis'],
      resume: 'sneha_resume.pdf',
      phone: '+91 9876543212'
    },
    {
      userId: studentUsers[3].id,
      cgpa: 7.2,
      branch: 'Electronics',
      backlogs: 2,
      skills: ['C++', 'Embedded Systems', 'IoT'],
      resume: 'rahul_resume.pdf',
      phone: '+91 9876543213'
    },
    {
      userId: studentUsers[4].id,
      cgpa: 8.8,
      branch: 'Computer Science',
      backlogs: 0,
      skills: ['JavaScript', 'Angular', 'TypeScript', 'Docker', 'Kubernetes'],
      resume: 'neha_resume.pdf',
      phone: '+91 9876543214'
    }
  ];
  
  studentProfiles.forEach(profile => Storage.addOrUpdateProfile(profile));
  
  // Sample Placement Drives
  const drives = [
    {
      company: 'Google India',
      role: 'Software Engineer',
      minCGPA: 8.0,
      branches: ['Computer Science', 'Information Technology'],
      maxBacklogs: 0,
      skills: ['JavaScript', 'Python', 'Data Structures', 'Algorithms'],
      ctc: '₹18 LPA',
      deadline: '2026-02-15',
      description: 'Looking for passionate software engineers to join our India team.'
    },
    {
      company: 'Microsoft',
      role: 'Full Stack Developer',
      minCGPA: 7.5,
      branches: ['Computer Science', 'Information Technology', 'Electronics'],
      maxBacklogs: 1,
      skills: ['React', 'Node.js', 'Azure', 'C#'],
      ctc: '₹16 LPA',
      deadline: '2026-02-20',
      description: 'Join Microsoft to work on cutting-edge cloud technologies.'
    },
    {
      company: 'Amazon',
      role: 'Software Development Engineer',
      minCGPA: 7.0,
      branches: ['Computer Science', 'Information Technology'],
      maxBacklogs: 1,
      skills: ['Java', 'AWS', 'System Design', 'Data Structures'],
      ctc: '₹20 LPA',
      deadline: '2026-02-25',
      description: 'Build scalable systems that serve millions of customers.'
    },
    {
      company: 'Infosys',
      role: 'Systems Engineer',
      minCGPA: 6.5,
      branches: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical'],
      maxBacklogs: 2,
      skills: ['Java', 'Python', 'SQL'],
      ctc: '₹4.5 LPA',
      deadline: '2026-03-01',
      description: 'Great opportunity for freshers to start their tech career.'
    },
    {
      company: 'Flipkart',
      role: 'Frontend Engineer',
      minCGPA: 7.5,
      branches: ['Computer Science', 'Information Technology'],
      maxBacklogs: 0,
      skills: ['React', 'JavaScript', 'CSS', 'Redux'],
      ctc: '₹12 LPA',
      deadline: '2026-02-28',
      description: 'Create amazing shopping experiences for millions of users.'
    },
    {
      company: 'TCS',
      role: 'Digital Analyst',
      minCGPA: 6.0,
      branches: ['Computer Science', 'Information Technology', 'Electronics'],
      maxBacklogs: 3,
      skills: ['Python', 'SQL', 'Data Analysis'],
      ctc: '₹3.6 LPA',
      deadline: '2026-03-05',
      description: 'Join TCS Digital for exciting projects in analytics.'
    }
  ];
  
  drives.forEach(drive => Storage.addDrive(drive));
  
  // Sample Applications
  const createdDrives = Storage.getDrives();
  const applications = [
    {
      studentId: studentUsers[0].id,
      driveId: createdDrives[0].id,
      status: 'Shortlisted'
    },
    {
      studentId: studentUsers[0].id,
      driveId: createdDrives[1].id,
      status: 'Applied'
    },
    {
      studentId: studentUsers[2].id,
      driveId: createdDrives[0].id,
      status: 'Selected'
    },
    {
      studentId: studentUsers[2].id,
      driveId: createdDrives[2].id,
      status: 'Applied'
    },
    {
      studentId: studentUsers[4].id,
      driveId: createdDrives[4].id,
      status: 'Shortlisted'
    }
  ];
  
  applications.forEach(app => Storage.addApplication(app));
  
  // Sample Referrals
  const alumniUsers = createdUsers.filter(u => u.role === 'alumni');
  const referrals = [
    {
      alumniId: alumniUsers[0].id,
      alumniName: alumniUsers[0].name,
      company: 'Adobe',
      role: 'UI/UX Developer',
      description: 'Looking for creative developers with strong design sense. Contact me for referral.',
      email: 'arjun@alumni.edu'
    },
    {
      alumniId: alumniUsers[1].id,
      alumniName: alumniUsers[1].name,
      company: 'Salesforce',
      role: 'Backend Developer',
      description: 'My team is hiring. Good opportunity for Java/Spring developers.',
      email: 'kavya@alumni.edu'
    },
    {
      alumniId: alumniUsers[0].id,
      alumniName: alumniUsers[0].name,
      company: 'Netflix',
      role: 'Data Engineer',
      description: 'Excellent opportunity to work on big data and streaming technologies.',
      email: 'arjun@alumni.edu'
    }
  ];
  
  referrals.forEach(ref => Storage.addReferral(ref));
  
  // Sample Mentorship Bookings
  const bookings = [
    {
      studentId: studentUsers[0].id,
      studentName: studentUsers[0].name,
      alumniId: alumniUsers[0].id,
      alumniName: alumniUsers[0].name,
      topic: 'Career Guidance in Product Companies',
      date: '2026-02-10',
      time: '10:00 AM',
      status: 'Confirmed'
    },
    {
      studentId: studentUsers[1].id,
      studentName: studentUsers[1].name,
      alumniId: alumniUsers[1].id,
      alumniName: alumniUsers[1].name,
      topic: 'Resume Review and Interview Prep',
      date: '2026-02-12',
      time: '2:00 PM',
      status: 'Pending'
    }
  ];
  
  bookings.forEach(booking => Storage.addMentorshipBooking(booking));
  
  console.log('Sample data generated successfully!');
  console.log('Login credentials:');
  console.log('TPO: tpo@college.edu / tpo123');
  console.log('Student: priya@student.edu / student123');
  console.log('Alumni: arjun@alumni.edu / alumni123');
}

// Generate sample data on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', generateSampleData);
} else {
  generateSampleData();
}