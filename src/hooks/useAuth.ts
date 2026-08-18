/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Profile } from '../types';

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser);

        if (firebaseUser) {
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            
            // Listen to real-time profile updates
            unsubscribeProfile = onSnapshot(userDocRef, async (docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data();
                setProfile({
                  id: firebaseUser.uid,
                  name: data.name || firebaseUser.displayName || 'Freelancer',
                  businessName: data.businessName || null,
                  email: data.email || firebaseUser.email || '',
                  createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                });
              } else {
                // Ensure profile document exists
                const fallbackProfile = {
                  name: firebaseUser.displayName || 'Freelancer',
                  businessName: null,
                  email: firebaseUser.email || '',
                  createdAt: serverTimestamp(),
                };
                await setDoc(userDocRef, fallbackProfile);
                setProfile({
                  id: firebaseUser.uid,
                  name: fallbackProfile.name,
                  businessName: null,
                  email: fallbackProfile.email,
                  createdAt: new Date().toISOString(),
                });
              }
              setLoading(false);
            }, (profileErr) => {
              console.error('Error fetching user profile:', profileErr);
              setProfile({
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'Freelancer',
                businessName: null,
                email: firebaseUser.email || '',
              });
              setLoading(false);
            });

          } catch (err: any) {
            console.error('Auth sync error:', err);
            setError(err);
            setLoading(false);
          }
        } else {
          if (unsubscribeProfile) {
            unsubscribeProfile();
            unsubscribeProfile = null;
          }
          setProfile(null);
          setLoading(false);
        }
      },
      (authError) => {
        console.error('Auth state change error:', authError);
        setError(authError);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const refreshProfile = async () => {
    if (!auth.currentUser) return;
    try {
      const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (snap.exists()) {
        const data = snap.data();
        setProfile({
          id: auth.currentUser.uid,
          name: data.name || auth.currentUser.displayName || 'Freelancer',
          businessName: data.businessName || null,
          email: data.email || auth.currentUser.email || '',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.error('Error refreshing profile:', err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return {
    user,
    profile,
    loading,
    error,
    logout: handleLogout,
    refreshProfile,
  };
}
