import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

const SALT_ROUNDS = 12;

/**
 * Ensure an admin user exists from env (ADMIN_EMAIL + ADMIN_PASSWORD or ADMIN_PASSWORD_HASH).
 * Call after MongoDB is connected. Safe to run on every startup.
 */
export async function bootstrapAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim()?.toLowerCase();
  const plainPassword = process.env.ADMIN_PASSWORD?.trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();

  if (!email) {
    console.log('[bootstrap] ADMIN_EMAIL not set; skipping admin user creation.');
    return;
  }

  if (!plainPassword && !passwordHash) {
    console.warn('[bootstrap] ADMIN_EMAIL set but neither ADMIN_PASSWORD nor ADMIN_PASSWORD_HASH set.');
    return;
  }

  try {
    const existing = await User.findOne({ email }).lean();
    if (existing) {
      if (existing.role === 'admin') {
        console.log('[bootstrap] Admin user already exists:', email);
        return;
      }
      console.warn('[bootstrap] User exists with role', existing.role, '- not overwriting.');
      return;
    }

    const hash = passwordHash || (await bcrypt.hash(plainPassword, SALT_ROUNDS));
    await User.create({
      email,
      passwordHash: hash,
      role: 'admin',
      name: process.env.ADMIN_NAME?.trim() || 'Admin',
    });
    console.log('[bootstrap] Admin user created:', email);
  } catch (err) {
    console.error('[bootstrap] Failed to create admin user:', err.message);
  }
}
