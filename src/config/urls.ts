

const URLs = {
  base: 'https://hirephpdeveloperindia.com/bezzie/api',

  socketUrl: '',

  SHARE_URL: 'https://hirephpdeveloperindia.com/referral',
  inviteUrls: [
    'com.gandharva://invite/link',
    'https://hirephpdeveloperindia.com/referral',
  ],

  // API end points
  basicSetting: '/setting',
  registration: '/register',
  resendUserVerifyOtp: '/resend-otp',
  verifyUser: '/verify-otp',
  basicDetail: '/basic-info-update',
  uploadProfile: '/profile-photo-upload',
  userVerificationID: '/id-verification',
  login: '/login',
  profile: '/freelancer/my-profile',
  updateProfile: '/freelancer/profile-update',
  logout: '/logout',
  forgotPassword: '/forget-password',
  verifyOtp: '/forget-password-otp-verification',
  resendOtp: '/resend-otp',
  resetPassword: '/update-password',

  jobList: '/freelancer/latest-jobs',
  jobDetail: '/freelancer/job-detail',
  jobApply: '/freelancer/apply-job',
  addSavedJob: '/freelancer/save-job',
  removeSavedJob: '/freelancer/remove-job',
  mySavedJobs: '/freelancer/saved-jobs',
  applyJobs: '/freelancer/apply-jobs',
  activeJobs: '/freelancer/active-jobs',
  completeJobs: '/freelancer/complete-jobs',
};

export default URLs;
