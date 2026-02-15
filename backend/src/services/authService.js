const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const env = require('../config/env');
const { generateToken } = require('../utils/hash');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

function generateAccessToken(userId) {
  return jwt.sign({ userId }, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
}

function generateRefreshToken(userId) {
  return jwt.sign({ userId }, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn });
}

async function register({ email, password, fullName, companyName }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const emailVerifyToken = generateToken();

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      companyName,
      emailVerifyToken,
    },
  });

  // Create default free subscription
  await prisma.subscription.create({
    data: {
      userId: user.id,
      planName: 'free',
      planPrice: 0,
      billingCycle: 'monthly',
      status: 'active',
      maxFolders: 1,
      maxTables: 2,
      maxJobsPerMonth: 100,
    },
  });

  try {
    await sendVerificationEmail(email, emailVerifyToken);
  } catch (e) {
    console.error('Failed to send verification email:', e.message);
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  return {
    user: { id: user.id, email: user.email, fullName: user.fullName },
    accessToken,
    refreshToken,
  };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      companyName: user.companyName,
      subscriptionTier: user.subscriptionTier,
      emailVerified: user.emailVerified,
    },
    accessToken,
    refreshToken,
  };
}

async function refreshToken(token) {
  const payload = jwt.verify(token, env.jwt.refreshSecret);
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.isActive) {
    const err = new Error('Invalid token');
    err.status = 401;
    throw err;
  }

  return {
    accessToken: generateAccessToken(user.id),
    refreshToken: generateRefreshToken(user.id),
  };
}

async function verifyEmail(token) {
  const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
  if (!user) {
    const err = new Error('Invalid verification token');
    err.status = 400;
    throw err;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerifyToken: null },
  });

  return { message: 'Email verified successfully' };
}

async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { message: 'If that email exists, a reset link has been sent' };

  const token = generateToken();
  const expires = new Date(Date.now() + 3600000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: token, passwordResetExpires: expires },
  });

  try {
    await sendPasswordResetEmail(email, token);
  } catch (e) {
    console.error('Failed to send reset email:', e.message);
  }

  return { message: 'If that email exists, a reset link has been sent' };
}

async function resetPassword(token, newPassword) {
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { gt: new Date() },
    },
  });

  if (!user) {
    const err = new Error('Invalid or expired reset token');
    err.status = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, passwordResetToken: null, passwordResetExpires: null },
  });

  return { message: 'Password reset successfully' };
}

module.exports = {
  register,
  login,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
