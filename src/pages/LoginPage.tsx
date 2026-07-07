/* ============================================================
 * Screen — Login (§5.1)
 * ============================================================
 * Pure static login page — uses React Router for navigation.
 * ============================================================ */

import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_HOME_ROUTE } from "@/constants/permissions";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState("");

  if (user) {
    return <Navigate to={ROLE_HOME_ROUTE[user.role]} replace />;
  }

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = "Enter a valid email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email.";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const success = await login(email, password);
      if (!success) {
        setAuthError("Incorrect email or password.");
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch {
      setAuthError("Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="erp-login-page">
      <div className="erp-login-card">
        <div className="erp-login-card__logo">
          <div className="erp-login-card__logo-glyph" aria-hidden="true" />
          <span className="erp-login-card__logo-text">MINI ERP</span>
        </div>

        <h1 className="erp-login-card__heading">Sign in</h1>
        <p className="erp-login-card__subtext">
          Use your work email and password.
        </p>

        {authError && (
          <div className="erp-auth-error" role="alert">
            {authError}
          </div>
        )}

        <form className="erp-login-card__form" onSubmit={handleSubmit} noValidate>
          <div className="erp-field">
            <label className="erp-field__label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              className={`erp-input${errors.email ? " erp-input--error" : ""}`}
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              autoComplete="email"
            />
            {errors.email && (
              <span className="erp-field__helper erp-field__helper--error">
                {errors.email}
              </span>
            )}
          </div>

          <div className="erp-field">
            <label className="erp-field__label" htmlFor="login-password">
              Password
            </label>
            <div className="erp-input-wrapper erp-input-wrapper--has-right-icon">
              <input
                id="login-password"
                className={`erp-input${errors.password ? " erp-input--error" : ""}`}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="erp-input-wrapper__icon-right"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && (
              <span className="erp-field__helper erp-field__helper--error">
                {errors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="erp-btn erp-btn--lg erp-btn--primary erp-btn--full"
            disabled={loading}
          >
            {loading && <Loader2 className="erp-btn__spinner" />}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="erp-login-card__footer">
          Contact your administrator if you don&apos;t have an account.
        </p>
      </div>
    </div>
  );
}
