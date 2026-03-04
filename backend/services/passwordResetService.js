const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const OFFICIAL_EMAIL = "jnananet.team@gmail.com";
const AUTH_DB_FILE = path.join(__dirname, "..", "data", "auth-users.json");
const RESET_TOKEN_TTL_MINUTES = Number(process.env.RESET_TOKEN_TTL_MINUTES || 30);
const RESET_TOKEN_TTL_MS = Math.max(5, RESET_TOKEN_TTL_MINUTES) * 60 * 1000;

let transporter;

function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function getDefaultAuthDb() {
  return {
    users: [],
    resetRequests: [],
  };
}

async function ensureAuthDbFile() {
  const dbDirectory = path.dirname(AUTH_DB_FILE);
  await fs.mkdir(dbDirectory, { recursive: true });

  try {
    await fs.access(AUTH_DB_FILE);
  } catch {
    await fs.writeFile(AUTH_DB_FILE, JSON.stringify(getDefaultAuthDb(), null, 2), "utf8");
  }
}

async function readAuthDb() {
  await ensureAuthDbFile();

  try {
    const raw = await fs.readFile(AUTH_DB_FILE, "utf8");
    const parsed = raw ? JSON.parse(raw) : getDefaultAuthDb();

    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      resetRequests: Array.isArray(parsed.resetRequests) ? parsed.resetRequests : [],
    };
  } catch {
    return getDefaultAuthDb();
  }
}

async function writeAuthDb(db) {
  const normalized = {
    users: Array.isArray(db?.users) ? db.users : [],
    resetRequests: Array.isArray(db?.resetRequests) ? db.resetRequests : [],
  };

  await fs.writeFile(AUTH_DB_FILE, JSON.stringify(normalized, null, 2), "utf8");
}

function getTransporter() {
  if (transporter) return transporter;

  const smtpUser = process.env.SMTP_USER || OFFICIAL_EMAIL;
  const smtpAppPassword = process.env.SMTP_APP_PASSWORD;

  if (!smtpAppPassword) {
    throw new Error("SMTP_APP_PASSWORD is not configured for password reset email.");
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpUser,
      pass: smtpAppPassword,
    },
  });

  return transporter;
}

async function syncAccountPassword({ email, password, name = "" }) {
  const normalizedEmail = normalizeEmail(email);
  const safePassword = String(password || "").trim();

  if (!normalizedEmail || !safePassword) {
    return false;
  }

  const db = await readAuthDb();
  const passwordHash = await bcrypt.hash(safePassword, 12);
  const now = new Date().toISOString();
  const existingIndex = db.users.findIndex((user) => normalizeEmail(user.email) === normalizedEmail);

  if (existingIndex >= 0) {
    db.users[existingIndex] = {
      ...db.users[existingIndex],
      email: normalizedEmail,
      name: name || db.users[existingIndex].name || "",
      passwordHash,
      updatedAt: now,
    };
  } else {
    db.users.push({
      email: normalizedEmail,
      name,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });
  }

  await writeAuthDb(db);
  return true;
}

async function createPasswordResetRequest(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new Error("email is required");
  }

  const db = await readAuthDb();
  const now = Date.now();
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(token);

  db.resetRequests = db.resetRequests.filter((entry) => {
    const notExpired = Number(entry.expiresAt || 0) > now;
    const differentEmail = normalizeEmail(entry.email) !== normalizedEmail;
    return notExpired && differentEmail;
  });

  db.resetRequests.push({
    email: normalizedEmail,
    tokenHash,
    expiresAt: now + RESET_TOKEN_TTL_MS,
    createdAt: new Date(now).toISOString(),
  });

  await writeAuthDb(db);
  return token;
}

async function sendPasswordResetEmail({ toEmail, resetLink }) {
  const normalizedEmail = normalizeEmail(toEmail);
  const smtpUser = process.env.SMTP_USER || OFFICIAL_EMAIL;
  const transporterClient = getTransporter();

  const message = `Hello,

You requested to reset your password for JnanaNet – AI Powered Scholarship Discovery Platform.

Click the link below to reset your password:

${resetLink}

If you did not request this password reset, you can safely ignore this email.

Regards,
JnanaNet Team
${OFFICIAL_EMAIL}`;

  await transporterClient.sendMail({
    from: `JnanaNet Team <${smtpUser}>`,
    to: normalizedEmail,
    subject: "JnanaNet Password Reset",
    text: message,
  });
}

async function resetPasswordWithToken({ email, token, newPassword }) {
  const normalizedEmail = normalizeEmail(email);
  const safeToken = String(token || "").trim();
  const safeNewPassword = String(newPassword || "").trim();

  if (!normalizedEmail || !safeToken || !safeNewPassword) {
    return false;
  }

  const db = await readAuthDb();
  const now = Date.now();
  const tokenHash = hashResetToken(safeToken);

  const requestIndex = db.resetRequests.findIndex(
    (entry) => normalizeEmail(entry.email) === normalizedEmail
      && String(entry.tokenHash) === tokenHash
      && Number(entry.expiresAt || 0) > now
  );

  if (requestIndex === -1) {
    return false;
  }

  const passwordHash = await bcrypt.hash(safeNewPassword, 12);
  const timestamp = new Date().toISOString();
  const userIndex = db.users.findIndex((user) => normalizeEmail(user.email) === normalizedEmail);

  if (userIndex >= 0) {
    db.users[userIndex] = {
      ...db.users[userIndex],
      email: normalizedEmail,
      passwordHash,
      updatedAt: timestamp,
    };
  } else {
    db.users.push({
      email: normalizedEmail,
      name: "",
      passwordHash,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  db.resetRequests = db.resetRequests.filter((entry) => normalizeEmail(entry.email) !== normalizedEmail);

  await writeAuthDb(db);
  return true;
}

module.exports = {
  normalizeEmail,
  createPasswordResetRequest,
  sendPasswordResetEmail,
  resetPasswordWithToken,
  syncAccountPassword,
};
