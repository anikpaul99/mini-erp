/* ============================================================
 * Types — System Users
 * ============================================================ */

import type { Role } from "./auth";

export type UserStatus = "Active" | "Inactive";

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  dateJoined: string;
}
