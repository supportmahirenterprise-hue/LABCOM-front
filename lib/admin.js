export const SUPERADMIN_EMAILS = [
  "vishal.nexios@gmail.com",
];

export function isSuperAdmin(email) {
  if (!email || typeof email !== "string") return false;
  const clean = email.toLowerCase().trim();
  return SUPERADMIN_EMAILS.includes(clean);
}
