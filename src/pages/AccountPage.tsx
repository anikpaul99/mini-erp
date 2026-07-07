/* ============================================================
 * Screen — Account Settings (§5.21)
 * ============================================================ */

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { simulateDelay } from "@/mock/helpers";

export default function AccountPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {}
  );

  if (!user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    await simulateDelay();
    setSavingProfile(false);
    addToast("success", "Profile updated.");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!currentPassword) errs.current = "Current password is required.";
    if (!newPassword) errs.new = "New password is required.";
    if (newPassword !== confirmPassword)
      errs.confirm = "Passwords don't match.";
    setPasswordErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSavingPassword(true);
    await simulateDelay();
    setSavingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    addToast("success", "Password changed.");
  };

  return (
    <>
      <div className="erp-page-header">
        <div className="erp-page-header__left">
          <h1 className="text-display">Account Settings</h1>
        </div>
      </div>

      <div className="erp-account-sections">
        {/* Profile Card */}
        <div className="erp-card erp-account-card">
          <div className="erp-card__header">
            <h2 className="erp-card__title">Profile</h2>
          </div>
          <form onSubmit={handleSaveProfile}>
            <div className="erp-account-card__field">
              <span className="erp-account-card__field-label">Role</span>
              <span className="erp-badge erp-badge--neutral">{user.role}</span>
            </div>

            <div className="erp-field">
              <label className="erp-field__label" htmlFor="account-name">
                Full Name
              </label>
              <input
                id="account-name"
                className="erp-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="erp-field">
              <label className="erp-field__label" htmlFor="account-email">
                Email
              </label>
              <input
                id="account-email"
                className="erp-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="erp-btn erp-btn--md erp-btn--primary erp-mt-16"
              disabled={savingProfile}
            >
              {savingProfile && <Loader2 className="erp-btn__spinner" />}
              {savingProfile ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Password Card */}
        <div className="erp-card erp-account-card">
          <div className="erp-card__header">
            <h2 className="erp-card__title">Change Password</h2>
          </div>
          <form onSubmit={handleChangePassword}>
            <div className="erp-field">
              <label className="erp-field__label" htmlFor="current-password">
                Current Password
              </label>
              <input
                id="current-password"
                className={`erp-input${
                  passwordErrors.current ? " erp-input--error" : ""
                }`}
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
              {passwordErrors.current && (
                <span className="erp-field__helper erp-field__helper--error">
                  {passwordErrors.current}
                </span>
              )}
            </div>

            <div className="erp-field">
              <label className="erp-field__label" htmlFor="new-password">
                New Password
              </label>
              <input
                id="new-password"
                className={`erp-input${
                  passwordErrors.new ? " erp-input--error" : ""
                }`}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
              {passwordErrors.new && (
                <span className="erp-field__helper erp-field__helper--error">
                  {passwordErrors.new}
                </span>
              )}
            </div>

            <div className="erp-field">
              <label className="erp-field__label" htmlFor="confirm-password">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                className={`erp-input${
                  passwordErrors.confirm ? " erp-input--error" : ""
                }`}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
              {passwordErrors.confirm && (
                <span className="erp-field__helper erp-field__helper--error">
                  {passwordErrors.confirm}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="erp-btn erp-btn--md erp-btn--outline erp-mt-16"
              disabled={savingPassword}
            >
              {savingPassword && <Loader2 className="erp-btn__spinner" />}
              {savingPassword ? "Updating…" : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
