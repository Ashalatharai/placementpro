// LocalStorage Helper Functions

const Storage = {
  // Get data from localStorage
  get(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  // Set data to localStorage
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  // Remove data from localStorage
  remove(key) {
    localStorage.removeItem(key);
  },

  // Clear all localStorage
  clear() {
    localStorage.clear();
  },

  // Initialize storage with default structure
  init() {
    if (!this.get('users')) this.set('users', []);
    if (!this.get('placementDrives')) this.set('placementDrives', []);
    if (!this.get('applications')) this.set('applications', []);
    if (!this.get('referrals')) this.set('referrals', []);
    if (!this.get('mentorshipBookings')) this.set('mentorshipBookings', []);
    if (!this.get('studentProfiles')) this.set('studentProfiles', []);
  },

  // User operations
  getUsers() {
    return this.get('users') || [];
  },

  addUser(user) {
    const users = this.getUsers();
    user.id = Date.now().toString();
    users.push(user);
    this.set('users', users);
    return user;
  },

  getUserById(id) {
    const users = this.getUsers();
    return users.find(u => u.id === id);
  },

 getUserByEmail(email) {
    const users = this.getUsers();
    // Compare emails directly in lowercase to guarantee a match
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  updateUser(id, updates) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      this.set('users', users);
      return users[index];
    }
    return null;
  },

  // Placement Drive operations
  getDrives() {
    return this.get('placementDrives') || [];
  },

  addDrive(drive) {
    const drives = this.getDrives();
    drive.id = Date.now().toString();
    drive.createdAt = new Date().toISOString();
    drives.push(drive);
    this.set('placementDrives', drives);
    return drive;
  },

  getDriveById(id) {
    const drives = this.getDrives();
    return drives.find(d => d.id === id);
  },

  updateDrive(id, updates) {
    const drives = this.getDrives();
    const index = drives.findIndex(d => d.id === id);
    if (index !== -1) {
      drives[index] = { ...drives[index], ...updates };
      this.set('placementDrives', drives);
      return drives[index];
    }
    return null;
  },

  deleteDrive(id) {
    const drives = this.getDrives();
    const filtered = drives.filter(d => d.id !== id);
    this.set('placementDrives', filtered);
  },

  // Application operations
  getApplications() {
    return this.get('applications') || [];
  },

  addApplication(application) {
    const applications = this.getApplications();
    application.id = Date.now().toString();
    application.appliedAt = new Date().toISOString();
    application.status = 'Applied';
    applications.push(application);
    this.set('applications', applications);
    return application;
  },

  getApplicationsByStudent(studentId) {
    const applications = this.getApplications();
    return applications.filter(a => a.studentId === studentId);
  },

  getApplicationsByDrive(driveId) {
    const applications = this.getApplications();
    return applications.filter(a => a.driveId === driveId);
  },

  hasApplied(studentId, driveId) {
    const applications = this.getApplications();
    return applications.some(a => a.studentId === studentId && a.driveId === driveId);
  },

  updateApplication(id, updates) {
    const applications = this.getApplications();
    const index = applications.findIndex(a => a.id === id);
    if (index !== -1) {
      applications[index] = { ...applications[index], ...updates };
      this.set('applications', applications);
      return applications[index];
    }
    return null;
  },

  // Student Profile operations
  getStudentProfiles() {
    return this.get('studentProfiles') || [];
  },

  addOrUpdateProfile(profile) {
    const profiles = this.getStudentProfiles();
    const index = profiles.findIndex(p => p.userId === profile.userId);
    
    if (index !== -1) {
      profiles[index] = { ...profiles[index], ...profile };
    } else {
      profiles.push(profile);
    }
    
    this.set('studentProfiles', profiles);
    return profile;
  },

  getProfileByUserId(userId) {
    const profiles = this.getStudentProfiles();
    return profiles.find(p => p.userId === userId);
  },

  // Referral operations
  getReferrals() {
    return this.get('referrals') || [];
  },

  addReferral(referral) {
    const referrals = this.getReferrals();
    referral.id = Date.now().toString();
    referral.postedAt = new Date().toISOString();
    referrals.push(referral);
    this.set('referrals', referrals);
    return referral;
  },

  // Mentorship operations
  getMentorshipBookings() {
    return this.get('mentorshipBookings') || [];
  },

  addMentorshipBooking(booking) {
    const bookings = this.getMentorshipBookings();
    booking.id = Date.now().toString();
    booking.bookedAt = new Date().toISOString();
    booking.status = 'Pending';
    bookings.push(booking);
    this.set('mentorshipBookings', bookings);
    return booking;
  },

  getBookingsByStudent(studentId) {
    const bookings = this.getMentorshipBookings();
    return bookings.filter(b => b.studentId === studentId);
  },

  getBookingsByAlumni(alumniId) {
    const bookings = this.getMentorshipBookings();
    return bookings.filter(b => b.alumniId === alumniId);
  },

  // Session management
  getSession() {
    return this.get('session');
  },

  setSession(userId, role, name) {
    this.set('session', { userId, role, name, timestamp: Date.now() });
  },

  clearSession() {
    this.remove('session');
  },

  isLoggedIn() {
    return !!this.getSession();
  }
};

// Initialize storage on load
Storage.init();