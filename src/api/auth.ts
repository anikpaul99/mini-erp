/* ============================================================
 * API — Authentication
 * ============================================================ */

import { APP_CONFIG } from "@/constants/config";
import type { ApiResponse } from "@/types/api";
import type {
  AuthApiUser,
  AuthSession,
  LoginRequest,
  LoginResponseData,
} from "@/types/auth";

function toAuthUser(user: AuthApiUser): AuthSession["user"] {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.roleId.name,
    avatar: user.img || undefined,
  };
}

export async function loginWithEmailPassword(
  credentials: LoginRequest
): Promise<AuthSession> {
  const response = await fetch(`${APP_CONFIG.apiBaseUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const payload = (await response.json()) as ApiResponse<LoginResponseData>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || payload.error || "Login failed");
  }

  return {
    user: toAuthUser(payload.data.user),
    accessToken: payload.data.accessToken,
    refreshToken: payload.data.refreshToken,
  };
}
