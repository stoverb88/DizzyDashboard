'use client';

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// Dizzy-auth-pages.tsx
// Single-file React/TypeScript components for Next.js 14 (App Router)
// Tailwind CSS + Framer Motion + lucide-react
// Place this file at /components/dizzy-auth-pages.tsx and ensure /public/DDlogobutton.svg exists.

// We'll inject a small CSS block at runtime (to avoid putting raw <style> before imports).
function useInjectWaveStyles() {
  useEffect(() => {
    const id = 'dizzy-auth-waves-style';
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.innerHTML = `@keyframes dizzy_waveflow {\n  0% { background-position: 0% 50%; }\n  50% { background-position: 100% 50%; }\n  100% { background-position: 0% 50%; }\n}\n.dz-bg-waves {\n  background: linear-gradient(120deg, rgba(255,255,255,0.03), rgba(34,34,34,0.12), rgba(255,255,255,0.03));\n  background-size: 200% 200%;\n  animation: dizzy_waveflow 14s ease-in-out infinite;\n  pointer-events: none;\n}\n`;
    document.head.appendChild(s);
    return () => { s.remove(); };
  }, []);
}

// -----------------------------
// Helper: Logo (uses public/asset path)
// -----------------------------
export function DizzyLogo({ className = "h-14" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img src="/DDlogobutton.svg" alt="Dizzy Dashboard" className="h-14 w-auto" />
      <div>
        <p style={{ fontWeight: 900, fontSize: "1.8rem", margin: 0, letterSpacing: "0.02em", color: "#1A202C" }}>DIZZY</p>
        <p style={{ fontWeight: 500, fontSize: "1.8rem", margin: 0, letterSpacing: "0.02em", color: "#1A202C" }}>DASHBOARD</p>
      </div>
    </div>
  );
}

// -----------------------------
// Text-only header used on subsequent pages (Style B)
// -----------------------------
export function TextOnlyHeader({ size = 'large' }: { size?: 'small' | 'large' }) {
  const large = size === 'large';
  return (
    <div className={`flex items-center justify-center ${large ? 'text-4xl' : 'text-2xl'}`}>
      <span style={{ fontWeight: 900, fontSize: large ? '2rem' : '1.2rem', letterSpacing: '0.02em', color: '#1A202C' }}>DIZZY</span>
      <span style={{ fontWeight: 400, fontSize: large ? '2rem' : '1.2rem', marginLeft: '0.5rem', letterSpacing: '0.02em', color: '#4A5568' }}>DASHBOARD</span>
    </div>
  );
}

// -----------------------------
// Shared UI elements
// -----------------------------
function PrimaryButton({ children, onClick, className = "", disabled = false }: { children: React.ReactNode; onClick?: () => void; className?: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-2xl py-3 text-sm font-semibold shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ background: "linear-gradient(180deg,#1A202C,#111827)", color: "white" }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-sm text-gray-200 underline"
    >
      {children}
    </button>
  );
}

function Input({ label, type = "text", value, onChange, placeholder, autoComplete }: any) {
  return (
    <label className="block text-sm">
      <div className="text-xs font-medium text-gray-700 mb-1">{label}</div>
      <input
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-xl px-4 py-3 bg-white/90 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
      />
    </label>
  );
}

// -----------------------------
// Page shell: applies gradient + subtle animated wave overlay
// -----------------------------
function PageShell({ children, lighten = false }: { children: React.ReactNode; lighten?: boolean }) {
  // inject styles once
  useInjectWaveStyles();

  // Brighter gradient - reduced intensity of darker colors
  const style = {
    background: `linear-gradient(180deg, #FFFFFF 0%, #C0C0C0 50%, #606060 100%)`,
    minHeight: '100vh',
    width: '100%',
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center relative overflow-hidden"
      style={style}
    >
      {/* animated subtle wave layer */}
      <div className="absolute inset-0 dz-bg-waves" style={{ opacity: 0.2 }} />

      {/* content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </motion.div>
  );
}

// -----------------------------
// RoleSelection (Landing) - Style A: Logo above, horizontal stylized text, full gradient
// -----------------------------
export function RoleSelection({ onSelect, onSecretTap }: { onSelect: (role: string) => void; onSecretTap?: () => void }) {
  return (
    <PageShell>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        textAlign: 'center',
        padding: '24px',
        paddingTop: '60px',
        minHeight: '100vh',
      }}>
        {/* Logo - centered */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <img
            src="/DDlogobutton.svg"
            alt="Dizzy Dashboard"
            style={{
              height: '180px',
              width: '180px',
              marginBottom: '16px',
              cursor: 'pointer',
              outline: 'none',
              border: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
            onClick={() => onSecretTap?.()}
            onMouseDown={(event) => event.preventDefault()}
            onPointerDown={(event) => event.preventDefault()}
          />
        </div>

        {/* Title - DIZZY DASHBOARD side by side */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', flexDirection: 'row' }}>
            <span style={{ fontWeight: 900, fontSize: '2.5rem', margin: 0, letterSpacing: '0.02em', color: '#1A202C' }}>DIZZY</span>
            <span style={{ fontWeight: 400, fontSize: '2.5rem', margin: 0, marginLeft: '0.5rem', letterSpacing: '0.02em', color: '#4A5568' }}>DASHBOARD</span>
          </div>
        </div>

        {/* Subtitle */}
        <p style={{ color: 'white', marginBottom: '48px', fontSize: '1rem' }}>Choose how you'd like to sign in</p>

        {/* Buttons - centered and stacked */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '400px',
          gap: '16px',
          marginBottom: '32px',
        }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect('clinician')}
            style={{
              width: '100%',
              padding: '12px 30px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#2D3748',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Clinician
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect('patient')}
            style={{
              width: '100%',
              padding: '12px 30px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#2D3748',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Patient
          </motion.button>
        </div>

        {/* Redeem Invite Code - white text link */}
        <button
          onClick={() => onSelect('invite')}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '14px',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Redeem Invite Code
        </button>
      </div>
    </PageShell>
  );
}

// -----------------------------
// MedicalLogin (Clinician) - Style B: Text-only header, form-focused
// -----------------------------
function MedicalLogin({ onBack, onLoginSuccess }: { onBack: () => void; onLoginSuccess: (user: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotToken, setForgotToken] = useState('');
  const [forgotStep, setForgotStep] = useState<'verify' | 'reset'>('verify');
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotPasswordConfirm, setForgotPasswordConfirm] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login/medical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid email or password. Please try again.');
        setIsLoading(false);
        return;
      }

      // Login successful - call success handler
      onLoginSuccess(data.user);
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const openForgotPassword = () => {
    setForgotOpen(true);
    setForgotEmail(email);
    setForgotToken('');
    setForgotPassword('');
    setForgotPasswordConfirm('');
    setForgotError('');
    setForgotMessage('');
    setForgotStep('verify');
  };

  const closeForgotPassword = () => {
    setForgotOpen(false);
    setForgotToken('');
    setForgotPassword('');
    setForgotPasswordConfirm('');
    setForgotError('');
    setForgotMessage('');
    setForgotStep('verify');
  };

  const handleForgotVerify = async () => {
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotError('Enter the clinician email associated with the account');
      return;
    }

    if (!forgotToken) {
      setForgotError('Enter the reset token provided by the admin');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    setForgotMessage('');

    try {
      const response = await fetch('/api/auth/password-reset/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim(), token: forgotToken.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setForgotError(data.error || 'Unable to verify reset token');
        setForgotLoading(false);
        return;
      }

      setForgotStep('reset');
      setForgotMessage('Reset window verified. Enter a new password below.');
    } catch (err) {
      console.error('Password reset verify error:', err);
      setForgotError('An unexpected error occurred. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotReset = async () => {
    if (forgotPassword.length < 8) {
      setForgotError('Password must be at least 8 characters');
      return;
    }

    if (forgotPassword !== forgotPasswordConfirm) {
      setForgotError('Passwords do not match');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    setForgotMessage('');

    try {
      const response = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          token: forgotToken.trim(),
          password: forgotPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setForgotError(data.error || 'Unable to reset password');
        setForgotLoading(false);
        return;
      }

      setForgotMessage('Password updated! Please log in with your new credentials.');
      setPassword(forgotPassword);
      setForgotPassword('');
      setForgotPasswordConfirm('');
      setForgotToken('');
      setForgotStep('verify');

      // Auto-close modal after 2 seconds to show success message
      setTimeout(() => {
        closeForgotPassword();
      }, 2000);
    } catch (err) {
      console.error('Password reset confirm error:', err);
      setForgotError('An unexpected error occurred. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <PageShell>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: '100vh',
        padding: '24px',
        paddingTop: '80px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#374151',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <TextOnlyHeader size="large" />
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: '#1A202C' }}>
            Welcome, Glad to see you!
          </h2>

          {error && (
            <div style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              fontSize: '14px',
              color: '#991B1B',
            }}>
              {error}
            </div>
          )}

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '90%' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Email</div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@clinic.org"
                autoComplete="email"
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: '1px solid #E5E7EB',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ width: '90%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>Password</div>
                <button
                  onClick={openForgotPassword}
                  style={{
                    fontSize: '12px',
                    color: '#4B5563',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                  }}
                  type="button"
                >
                  Forgot Password?
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    border: '1px solid #E5E7EB',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={() => setShow(!show)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogin}
              disabled={isLoading}
              style={{
                width: '90%',
                padding: '12px 30px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#2D3748',
                color: 'white',
                fontSize: '16px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </motion.button>

            <div style={{ width: '90%', textAlign: 'center', marginTop: '4px' }}>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4B5563',
                  fontSize: '14px',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                Need help signing in?
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '450px',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1F2937' }}>Reset Clinician Password</div>
                <p style={{ fontSize: '0.8125rem', color: '#6B7280', margin: 0 }}>
                  Enter the email and admin-provided token to unlock a new password field.
                </p>
              </div>
              <button
                onClick={closeForgotPassword}
                style={{
                  fontSize: '0.75rem',
                  color: '#6B7280',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>

            {forgotError && (
              <div style={{
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#991B1B',
                fontSize: '0.85rem',
              }}>
                {forgotError}
              </div>
            )}

            {forgotMessage && (
              <div style={{
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                fontSize: '0.85rem',
              }}>
                {forgotMessage}
              </div>
            )}

            <div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Clinician Email</div>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => {
                  setForgotEmail(e.target.value);
                  if (forgotStep === 'reset') {
                    setForgotStep('verify');
                    setForgotMessage('');
                  }
                }}
                placeholder="you@clinic.org"
                disabled={forgotLoading}
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  backgroundColor: forgotLoading ? '#F3F4F6' : 'rgba(255,255,255,0.9)',
                  border: '1px solid #E5E7EB',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Admin Reset Token</div>
              <input
                type="text"
                value={forgotToken}
                onChange={(e) => {
                  setForgotToken(e.target.value.toUpperCase());
                  if (forgotStep === 'reset') {
                    setForgotStep('verify');
                    setForgotMessage('');
                  }
                }}
                placeholder="Enter the token the admin shared"
                disabled={forgotLoading}
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  backgroundColor: forgotLoading ? '#F3F4F6' : 'rgba(255,255,255,0.9)',
                  border: '1px solid #E5E7EB',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  letterSpacing: '0.1em',
                }}
              />
            </div>

            {forgotStep === 'verify' ? (
              <button
                onClick={handleForgotVerify}
                disabled={forgotLoading}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#1F2937',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  cursor: forgotLoading ? 'not-allowed' : 'pointer',
                  opacity: forgotLoading ? 0.6 : 1,
                }}
              >
                {forgotLoading ? 'Checking...' : 'Verify reset window'}
              </button>
            ) : (
              <>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>New Password</div>
                  <input
                    type="password"
                    value={forgotPassword}
                    onChange={(e) => setForgotPassword(e.target.value)}
                    placeholder="Create a new password"
                    disabled={forgotLoading}
                    style={{
                      width: '100%',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      border: '1px solid #E5E7EB',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Confirm Password</div>
                  <input
                    type="password"
                    value={forgotPasswordConfirm}
                    onChange={(e) => setForgotPasswordConfirm(e.target.value)}
                    placeholder="Repeat the password"
                    disabled={forgotLoading}
                    style={{
                      width: '100%',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      border: '1px solid #E5E7EB',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  onClick={handleForgotReset}
                  disabled={forgotLoading}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    cursor: forgotLoading ? 'not-allowed' : 'pointer',
                    opacity: forgotLoading ? 0.6 : 1,
                  }}
                >
                  {forgotLoading ? 'Updating...' : 'Update password'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}

// -----------------------------
// PatientLogin (6-digit code)
// -----------------------------
function DigitInput({ index, value, onChange, onKeyDown, inputRef }: any) {
  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
      onKeyDown={onKeyDown}
      style={{
        width: '45px',
        height: '45px',
        textAlign: 'center',
        borderRadius: '8px',
        fontSize: '1.125rem',
        fontWeight: 500,
        backgroundColor: 'rgba(255,255,255,0.9)',
        border: '1px solid #E5E7EB',
        outline: 'none',
      }}
    />
  );
}

export function PatientLogin({ onBack, onLoginSuccess }: { onBack: () => void; onLoginSuccess: (user: any) => void }) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // focus first empty
    const firstEmpty = digits.findIndex(d => d === '');
    if (firstEmpty >= 0) inputsRef.current[firstEmpty]?.focus();
  }, []);

  function handleChange(idx: number, val: string) {
    const copy = [...digits];
    copy[idx] = val;
    setDigits(copy);
    if (val && idx < 5) inputsRef.current[idx + 1]?.focus();
  }

  function handleKey(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && idx > 0) inputsRef.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < 5) inputsRef.current[idx + 1]?.focus();
  }

  const code = digits.join('');

  const handleLogin = async () => {
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login/patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
        credentials: 'include', // Required for SameSite=None cookies
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid code. Please check and try again.');
        setIsLoading(false);
        setDigits(['', '', '', '', '', '']);
        inputsRef.current[0]?.focus();
        return;
      }

      onLoginSuccess(data.user);
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
      setDigits(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    }
  };

  return (
    <PageShell>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: '100vh',
        padding: '24px',
        paddingTop: '80px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#374151',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <TextOnlyHeader size="large" />
          </div>

          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0, color: '#1A202C', lineHeight: 1.4 }}>
            Welcome, Please enter the access code from your healthcare provider below
          </h2>

          {error && (
            <div style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              fontSize: '14px',
              color: '#991B1B',
            }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              {digits.map((d, i) => (
                <DigitInput
                  key={i}
                  index={i}
                  value={d}
                  onChange={(v: string) => handleChange(i, v)}
                  onKeyDown={(e: any) => handleKey(i, e)}
                  inputRef={(el: HTMLInputElement | null) => (inputsRef.current[i] = el)}
                />
              ))}
            </div>

            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', width: '100%' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                disabled={isLoading}
                style={{
                  width: '90%',
                  padding: '12px 30px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#2D3748',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                {isLoading ? 'Signing in...' : 'Login'}
              </motion.button>
            </div>

            <div style={{
              marginTop: '20px',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.85)',
              border: '1px solid #E5E7EB',
              fontSize: '14px',
              color: '#1A202C',
              width: '90%',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}>
              <strong>Don't have a code?</strong> Ask your healthcare provider to issue one for you.
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// -----------------------------
// InviteCode Redemption (Clinician sign-up)
// -----------------------------
export function InviteCode({ onBack, onSuccess }: { onBack: () => void; onSuccess: (user: any) => void }) {
  const [inviteCode, setInviteCode] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (!inviteCode) {
      setError('Please enter invite code');
      return;
    }
    if (!email || !pw) {
      setError('Please fill email and password');
      return;
    }
    if (pw !== pw2) {
      setError('Passwords do not match');
      return;
    }
    if (pw.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/invites/medical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteCode: inviteCode.trim(),
          email: email.trim(),
          password: pw,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to redeem invite code. Please try again.');
        setIsLoading(false);
        return;
      }

      onSuccess(data.user);
    } catch (err) {
      console.error('Invite redemption error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <PageShell>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: '100vh',
        padding: '24px',
        paddingTop: '80px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#374151',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <TextOnlyHeader size="large" />
          </div>

          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0, color: '#1A202C' }}>
            Enter the invite code from your organization to create an account
          </h2>

          {error && (
            <div style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              fontSize: '14px',
              color: '#991B1B',
            }}>
              {error}
            </div>
          )}

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '90%' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Invite Code</div>
              <input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter invite code"
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: '1px solid #E5E7EB',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ width: '90%' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Your Email</div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@clinic.org"
                autoComplete="email"
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: '1px solid #E5E7EB',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ width: '90%' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Password</div>
              <div style={{ position: 'relative' }}>
                <input
                  type={show ? 'text' : 'password'}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="Create a password"
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    border: '1px solid #E5E7EB',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={() => setShow(!show)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ width: '90%' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Confirm Password</div>
              <input
                type={show ? 'text' : 'password'}
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                placeholder="Repeat password"
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: '1px solid #E5E7EB',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={isLoading}
              style={{
                width: '90%',
                padding: '12px 30px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#2D3748',
                color: 'white',
                fontSize: '16px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </motion.button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// -----------------------------
// Hidden Admin Login Modal
// -----------------------------
function AdminLoginModal({ onClose, router }: { onClose: () => void; router: any }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login/medical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Unable to sign in. Please try again.')
        setIsLoading(false)
        return
      }

      if (data.user?.role !== 'ADMIN') {
        setError('This account does not have admin access.')
        setIsLoading(false)
        return
      }

      router.push('/admin')
    } catch (err) {
      console.error('Admin login error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            border: 'none',
            background: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            color: '#6B7280',
          }}
          aria-label="Close admin login"
        >
          ×
        </button>

        <TextOnlyHeader size="small" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '16px 0 8px', color: '#1F2937' }}>
          Admin Access
        </h2>
        <p style={{ color: '#4B5563', fontSize: '0.95rem', marginBottom: '16px' }}>
          Enter administrator credentials to open the dashboard.
        </p>

        {error && (
          <div
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              fontSize: '14px',
              color: '#991B1B',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Email</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@clinic.org"
              autoComplete="username"
              style={{
                width: '100%',
                borderRadius: '12px',
                padding: '12px 16px',
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Password</div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              style={{
                width: '100%',
                borderRadius: '12px',
                padding: '12px 16px',
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              border: 'none',
              borderRadius: '12px',
              padding: '12px 20px',
              backgroundColor: '#1F2937',
              color: 'white',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? 'Signing in...' : 'Enter Admin Portal'}
          </button>
        </form>
      </div>
    </div>
  )
}

// -----------------------------
// Default component that wires a tiny client-side router so you can preview
// -----------------------------
export default function AuthScreens() {
  const router = useRouter();
  const [screen, setScreen] = useState<'role'|'clinician'|'patient'|'invite'>('role');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const secretTapRef = useRef({ count: 0, lastTap: 0 });

  const handleLoginSuccess = (user: any) => {
    // Store user data in localStorage for immediate access on /app page
    // This bypasses session cookie timing issues
    if (typeof window !== 'undefined') {
      localStorage.setItem('temp_user_data', JSON.stringify(user));
    }
    // Use Next.js router for client-side navigation with init flag
    router.push('/app?init=true');
  };

  const handleInviteSuccess = (user: any) => {
    console.log('Account created successfully:', user);
    // Store user data for immediate access
    if (typeof window !== 'undefined') {
      localStorage.setItem('temp_user_data', JSON.stringify(user));
    }
    // Redirect to main app
    router.push('/app?init=true');
  };

  const resetSecretTap = () => {
    secretTapRef.current.count = 0;
    secretTapRef.current.lastTap = 0;
  };

  const handleLogoSecretTap = () => {
    const now = Date.now();
    const withinWindow = now - secretTapRef.current.lastTap <= 800;
    secretTapRef.current.count = withinWindow ? secretTapRef.current.count + 1 : 1;
    secretTapRef.current.lastTap = now;

    if (secretTapRef.current.count >= 5) {
      resetSecretTap();
      setShowAdminModal(true);
    }
  };

  const closeAdminModal = () => {
    resetSecretTap();
    setShowAdminModal(false);
  };

  return (
    <div>
      {screen === 'role' && (
        <RoleSelection
          onSelect={(r) => setScreen(r === 'clinician' ? 'clinician' : r === 'patient' ? 'patient' : 'invite')}
          onSecretTap={handleLogoSecretTap}
        />
      )}
      {screen === 'clinician' && <MedicalLogin onBack={() => setScreen('role')} onLoginSuccess={handleLoginSuccess} />}
      {screen === 'patient' && <PatientLogin onBack={() => setScreen('role')} onLoginSuccess={handleLoginSuccess} />}
      {screen === 'invite' && <InviteCode onBack={() => setScreen('role')} onSuccess={handleInviteSuccess} />}

      {showAdminModal && <AdminLoginModal onClose={closeAdminModal} router={router} />}
    </div>
  );
}
