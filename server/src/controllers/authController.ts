import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { URL } from 'url';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '30d' });
};

const sendOtpEmail = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: `"HD Notes" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Verification Code',
    text: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
  });
};

export const signup = async (req: Request, res: Response) => {
  const { email, name, dob } = req.body;
  if (!email || !name || !dob) {
    return res.status(400).json({ message: 'Please provide name, email, and date of birth.' });
  }
  if (await User.findOne({ email })) {
    return res.status(400).json({ message: 'User with this email already exists. Please sign in.' });
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await User.findOneAndUpdate(
    { email },
    { name, email, dob, otp, otpExpires: new Date(Date.now() + 10 * 60 * 1000) },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await sendOtpEmail(email, otp);
  res.status(200).json({ message: 'OTP sent to your email for verification.' });
};

export const verifySignup = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const userQueryResult = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });
  if (!userQueryResult) { return res.status(400).json({ message: 'Invalid or expired OTP.' }); }
  
  const user = userQueryResult as IUser;

  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();
  
  const token = generateToken(user._id.toString());
  res.status(201).json({ token, name: user.name, email: user.email });
};

export const sendLoginOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found. Please create an account.' });
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  await sendOtpEmail(email, otp);
  res.status(200).json({ message: 'OTP sent to your email.' });
};

export const verifyLogin = async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const userQueryResult = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });
    if (!userQueryResult) { return res.status(400).json({ message: 'Invalid or expired OTP.' }); }
    
    const user = userQueryResult as IUser;
    
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    
    const token = generateToken(user._id.toString());
    res.status(200).json({ token, name: user.name, email: user.email });
};

export const getMe = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    res.status(200).json(req.user);
};

export const handleGoogleRedirect = async (req: Request, res: Response) => {
    if (!req.user) {
      const failureRedirectURL = new URL('/signin', process.env.FRONTEND_URL);
      failureRedirectURL.searchParams.set('error', 'auth_failed');
      return res.redirect(failureRedirectURL.toString());
    }

    const user = req.user as IUser;

    try {
        const token = generateToken(user._id.toString());

        const successRedirectURL = new URL('/auth/callback', process.env.FRONTEND_URL);
        successRedirectURL.searchParams.set('token', token);
        
        res.redirect(successRedirectURL.toString());

    } catch (error) {
        console.error("ERROR: Failed to generate token or redirect.", error);
        const errorRedirectURL = new URL('/signin', process.env.FRONTEND_URL);
        errorRedirectURL.searchParams.set('error', 'token_generation_failed');
        res.redirect(errorRedirectURL.toString());
    }
};