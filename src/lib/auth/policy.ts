// Only pass a user ID returned by trusted server-side identity verification.
export function isAdminIdentity(
  userId: string | null | undefined,
  adminUserId: string | undefined,
): boolean {
  return Boolean(adminUserId && userId && userId === adminUserId);
}
