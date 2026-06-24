/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, GraduationCap } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string, name: string) => void;
  initialMode?: 'login' | 'register';
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess, initialMode = 'login' }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all standard credentials.');
      return;
    }

    if (mode === 'register' && (!name || !university)) {
      setError('Please provide your name and current academic institution.');
      return;
    }

    setLoading(true);

    // Mock authentication delayed response
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(email, mode === 'register' ? name : email.split('@')[0]);
      onClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop wrapper */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#001142]/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100/80 z-10"
          >
            {/* Upper status ribbon with branding colors */}
            <div className="h-2 bg-[#016a61]" />

            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 id="modal-title" className="text-2xl font-bold text-[#001142]">
                    {mode === 'login' ? 'Welcome Back' : 'Create Student Account'}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    {mode === 'login'
                      ? 'Access campus opportunities instantly'
                      : 'Bridge academic ambition and career growth'}
                  </p>
                </div>
                <button
                  id="close-login-modal"
                  onClick={onClose}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form error warning */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg font-medium">
                  {error}
                </div>
              )}

              {/* Input section */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-[#001142] uppercase tracking-wider mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="register-name-field"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Than Tun"
                          className="w-full text-sm pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#001142] transition-all bg-slate-50/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#001142] uppercase tracking-wider mb-2">
                        University / Institution
                      </label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="register-university-field"
                          type="text"
                          required
                          value={university}
                          onChange={(e) => setUniversity(e.target.value)}
                          placeholder="MIIT"
                          className="w-full text-sm pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#001142] transition-all bg-slate-50/50"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#001142] uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="login-email-field"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="than.tun@university.edu"
                      className="w-full text-sm pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#001142] transition-all bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#001142] uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="login-password-field"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-sm pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-[#001142] transition-all bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Submit Trigger */}
                <button
                  id="submit-auth-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-[#016a61] hover:bg-[#005049] text-white font-medium text-sm py-3 rounded-lg flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all text-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : mode === 'login' ? (
                    'Log In'
                  ) : (
                    'Register Account'
                  )}
                </button>
              </form>

              {/* Mode Switch Footnote */}
              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500">
                  {mode === 'login' ? "Don't have an account yet?" : 'Already registered?'}
                  <button
                    id="switch-auth-mode-btn"
                    onClick={() => {
                      setMode(mode === 'login' ? 'register' : 'login');
                      setError('');
                    }}
                    className="ml-2 font-semibold text-[#016a61] hover:text-[#005049] transition-colors"
                  >
                    {mode === 'login' ? 'Create one' : 'Sign In'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
