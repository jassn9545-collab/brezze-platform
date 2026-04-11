
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
  profile: '/profile',
  updateProfile: '/update-profile',
  logout: '/logout',
  forgotPassword: '/forget-password',
  verifyOtp: '/forget-password-otp-verification',
  resendOtp: '/resend-otp',
  resetPassword: '/update-password',
  faq: '/get-faq',
  referEarn: '/refer-and-earn',
  withdrawReferEarn: '/withdraw-earning',
  getUserNotifications: '/notifications',

  // job
  createJob: '/client/new-job',
};

export default URLs;
