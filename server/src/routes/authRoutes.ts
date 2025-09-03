import express from 'express';
import passport from 'passport';
import { signup, verifySignup, sendLoginOtp, verifyLogin, getMe, handleGoogleRedirect } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/signup', signup);
router.post('/verify-signup', verifySignup);
router.post('/send-login-otp', sendLoginOtp);
router.post('/verify-login', verifyLogin);
router.get('/me', protect, getMe);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback', 
  passport.authenticate('google', { failureRedirect: '/', session: false }),
  handleGoogleRedirect
);

export default router;