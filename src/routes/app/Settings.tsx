/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  reauthenticateWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import {
  User,
  Building2,
  Mail,
  Save,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Trash2,
  AlertTriangle,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { auth, db, googleProvider } from '../../lib/firebase';
import { Navbar } from '../../components/Navbar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { useApp } from '../../lib/AppContext';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, firebaseUser, updateProfile, logout, authLoading } = useApp();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password State
  const isPasswordProvider = firebaseUser?.providerData?.some(
    (p) => p.providerId === 'password'
  );
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showReauthPrompt, setShowReauthPrompt] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBusinessName(user.businessName || '');
    }
  }, [user]);

  // Convert Firebase error codes into friendly human-readable messages
  const getFriendlyErrorMessage = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'The current password entered is incorrect.';
      case 'auth/weak-password':
        return 'The new password must be at least 6 characters long.';
      case 'auth/requires-recent-login':
        return 'This sensitive operation requires recent login. Please enter your current password to proceed.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again in a few minutes.';
      case 'auth/network-request-failed':
        return 'Network connection issue. Please check your internet and try again.';
      default:
        return err?.message || 'An unexpected error occurred. Please try again.';
    }
  };

  // 1. Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSaved(false);

    if (!name.trim()) {
      setProfileError('Please enter your name.');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile({
        name: name.trim(),
        businessName: businessName.trim() || null,
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 4000);
    } catch (err: any) {
      console.error('Save profile error:', err);
      setProfileError(getFriendlyErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  // 2. Change Password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSaved(false);

    if (!firebaseUser) return;

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match. Please verify.');
      return;
    }

    setSavingPassword(true);
    try {
      // If current password provided or reauth needed, re-authenticate first
      if (currentPassword && firebaseUser.email) {
        const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
        await reauthenticateWithCredential(firebaseUser, credential);
      }

      await updatePassword(firebaseUser, newPassword);
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowReauthPrompt(false);
      setTimeout(() => setPasswordSaved(false), 4000);
    } catch (err: any) {
      console.error('Password update error:', err);
      if (err?.code === 'auth/requires-recent-login') {
        setShowReauthPrompt(true);
        setPasswordError('Please provide your current password to verify your identity.');
      } else {
        setPasswordError(getFriendlyErrorMessage(err));
      }
    } finally {
      setSavingPassword(false);
    }
  };

  // 3. Logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  // 4. Delete Account
  const handleDeleteAccount = async () => {
    setDeleteError(null);

    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type "DELETE" into the box to confirm account deletion.');
      return;
    }

    if (!firebaseUser) return;

    setDeletingAccount(true);
    try {
      // Re-authenticate if user signed in with password and entered password
      if (isPasswordProvider && deletePassword && firebaseUser.email) {
        const credential = EmailAuthProvider.credential(firebaseUser.email, deletePassword);
        await reauthenticateWithCredential(firebaseUser, credential);
      } else if (!isPasswordProvider) {
        // Google auth user
        try {
          await reauthenticateWithPopup(firebaseUser, googleProvider);
        } catch (popupErr: any) {
          // If popup closed or not triggered, proceed to check if deleteUser works directly
          console.warn('Google reauth prompt was skipped or closed:', popupErr);
        }
      }

      const uid = firebaseUser.uid;

      // 1. Delete all quotes belonging to user
      // Note: Firestore writeBatch is limited to 500 operations. If a user has >500 quotes,
      // this should be chunked into multiple batches (e.g. slices of 450) or handled via a Cloud Function.
      const quotesRef = collection(db, 'quotes');
      const q = query(quotesRef, where('userId', '==', uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const batch = writeBatch(db);
        querySnapshot.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
      }

      // 2. Delete user profile doc
      const userDocRef = doc(db, 'users', uid);
      await deleteDoc(userDocRef);

      // 3. Delete Firebase Auth user
      await deleteUser(firebaseUser);

      // 4. Redirect to landing
      navigate('/');
    } catch (err: any) {
      console.error('Delete account error:', err);
      if (err?.code === 'auth/requires-recent-login') {
        setDeleteError('For security, please enter your current password below to confirm deletion.');
      } else {
        setDeleteError(getFriendlyErrorMessage(err));
      }
      setDeletingAccount(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50/60 pb-20 md:pb-8">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading your settings...</p>
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 pb-20 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Account Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your personal profile, WhatsApp signature, security, and account preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* 1. Profile Information Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Personal & Business Profile</h2>
            <p className="text-xs text-slate-500 mb-6">
              Your business name will automatically sign off your WhatsApp follow-up messages (e.g. "— Alex, Studio Craft").
            </p>

            {profileError && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSaved && (
              <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-700">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Profile details saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="settings-name"
                    type="text"
                    required
                    disabled={savingProfile}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Business / Agency / Studio Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    id="settings-business-name"
                    type="text"
                    disabled={savingProfile}
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Studio Craft or Apex Digital"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Used to sign off WhatsApp follow-ups so clients recognize your brand.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="settings-email"
                    type="email"
                    disabled
                    value={firebaseUser?.email || user?.email || ''}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Your primary authentication email (read-only).
                </p>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  id="btn-save-settings"
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* 2. Password Change (Only for Email/Password users) */}
          {isPasswordProvider && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <KeyRound className="w-4 h-4 text-slate-700" />
                <h2 className="text-base font-bold text-slate-900">Change Password</h2>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Update your account password. Must be at least 6 characters long.
              </p>

              {passwordError && (
                <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSaved && (
                <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Password updated successfully!</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {showReauthPrompt && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Current Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="input-current-password"
                        type="password"
                        required
                        disabled={savingPassword}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      New Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="input-new-password"
                        type="password"
                        required
                        minLength={6}
                        disabled={savingPassword}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="input-confirm-password"
                        type="password"
                        required
                        minLength={6}
                        disabled={savingPassword}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    id="btn-update-password"
                    type="submit"
                    disabled={savingPassword}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {savingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password…</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 3. Session Management Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Account Session</h3>
                <p className="text-xs text-slate-500">
                  Signed in as <span className="font-semibold text-slate-700">{firebaseUser?.email || user?.email || 'Freelancer'}</span>
                </p>
              </div>
              <button
                id="btn-logout-settings"
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* 4. Danger Zone - Delete Account */}
          <div className="bg-rose-50/40 border border-rose-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <h3 className="text-base font-bold text-rose-900">Delete Account</h3>
                </div>
                <p className="text-xs text-rose-700/80 max-w-md leading-relaxed">
                  Permanently remove your Ruomora account and delete all quotation records. This action is irreversible.
                </p>
              </div>

              <button
                id="btn-open-delete-account-modal"
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Delete Account Modal Dialog */}
        {showDeleteModal && (
          <div
            id="modal-delete-account"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          >
            <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-900">Permanently Delete Account?</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  All your tracked quotes, customer records, follow-up history, and profile data will be permanently wiped from the database.
                </p>
              </div>

              {deleteError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{deleteError}</span>
                </div>
              )}

              {isPasswordProvider && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm Your Password
                  </label>
                  <input
                    id="input-delete-account-password"
                    type="password"
                    disabled={deletingAccount}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Type <span className="text-rose-600 font-extrabold">DELETE</span> to confirm
                </label>
                <input
                  id="input-delete-account-confirm"
                  type="text"
                  disabled={deletingAccount}
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-rose-600 placeholder:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  id="btn-cancel-delete-account"
                  disabled={deletingAccount}
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteError(null);
                    setDeleteConfirmationText('');
                    setDeletePassword('');
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  id="btn-confirm-delete-account"
                  disabled={deletingAccount || deleteConfirmationText.trim().toUpperCase() !== 'DELETE'}
                  onClick={handleDeleteAccount}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingAccount ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting Account…</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Permanently Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
};
