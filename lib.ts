export const sessionOptions: SessionOptions = {
  password: 'complex_password_at_least_32_characters_long',
  cookieName: 'next_js_session',
  cookieOptions: {
    // Always use secure cookies in production
    secure: true,
    sameSite: 'lax', // This helps with CSRF
    httpOnly: true,  // Prevents client-side access to the cookie
  },
  ttl: 60 * 60 * 24 * 7, // 1 week
} 