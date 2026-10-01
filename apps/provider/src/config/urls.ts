

import {NativeModules} from 'react-native';

const getDevelopmentApiHost = (): string => {
  try {
    const sourceCode = NativeModules.SourceCode;
    const scriptURL: unknown =
      sourceCode?.getConstants?.()?.scriptURL ?? sourceCode?.scriptURL;
    if (typeof scriptURL === 'string') {
      const host = /^https?:\/\/(\[[^\]]+\]|[^:/?#]+)(?::\d+)?(?:[/?#]|$)/i.exec(scriptURL)?.[1];
      if (host) {
        const normalizedHost = host.replace(/^\[|\]$/g, '').toLowerCase();
        // USB devices reach the backend through adb reverse, just like Metro.
        return ['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(normalizedHost)
          ? '127.0.0.1'
          : host;
      }
    }
  } catch {
    // Metro URL is unavailable; use the USB-forwarded backend.
  }

  return '127.0.0.1';
};

const URLs = {
  base: __DEV__
    ? `http://${getDevelopmentApiHost()}:8000/api`
    : 'https://hirephpdeveloperindia.com/bezzie/api',

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
  applyJobs: '/freelancer/applied-jobs',
  activeJobs: '/freelancer/active-jobs',
  completeJobs: '/freelancer/completed-jobs',
  submitJob: '/freelancer/submit-work',
  paymentHistory: '/freelancer/payments',
  catalogs: '/freelancer/catalogs',
  chatConversations: '/chat/conversations',
};

export default URLs;
