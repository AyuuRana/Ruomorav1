/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { User, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { useAuth } from '../hooks/useAuth';
import { Quote, Profile, Status } from '../types';
import { getLocalToday, addDaysToDate } from './followUpLogic';

interface AppContextType {
  firebaseUser: User | null;
  user: Profile | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  quotes: Quote[];
  quotesLoading: boolean;
  logout: () => Promise<void>;
  updateProfile: (data: { name: string; businessName?: string | null }) => Promise<void>;
  addQuote: (quote: Omit<Quote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateQuote: (id: string, updates: Partial<Quote>) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  markFollowedUp: (id: string, nextFollowUpDate: string, notesAppend?: string) => Promise<void>;
  updateStatus: (id: string, status: Status) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: firebaseUser, profile: user, loading: authLoading, logout: authLogout } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState<boolean>(true);

  // Synchronize Firestore quotes for authenticated user
  useEffect(() => {
    if (!firebaseUser) {
      setQuotes([]);
      setQuotesLoading(false);
      return;
    }

    setQuotesLoading(true);
    const quotesCol = collection(db, 'quotes');
    const q = query(quotesCol, where('userId', '==', firebaseUser.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedQuotes: Quote[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            userId: data.userId,
            customerName: data.customerName || '',
            phone: data.phone || '',
            amount: typeof data.amount === 'number' ? data.amount : parseFloat(data.amount) || 0,
            quoteDate: data.quoteDate || getLocalToday(),
            followUpDate: data.followUpDate || getLocalToday(),
            status: (data.status as Status) || 'waiting',
            notes: data.notes || null,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.quoteDate,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.quoteDate,
          };
        });

        // Client-side sort by follow-up date ascending
        fetchedQuotes.sort((a, b) => new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime());

        setQuotes(fetchedQuotes);
        setQuotesLoading(false);
      },
      (error) => {
        console.error('Error fetching quotes from Firestore:', error);
        setQuotesLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser]);

  const updateProfileData = async (data: { name: string; businessName?: string | null }) => {
    if (!firebaseUser) return;
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(
      userDocRef,
      {
        name: data.name,
        businessName: data.businessName || null,
        email: firebaseUser.email || '',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const addQuote = async (
    quoteData: Omit<Quote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    if (!firebaseUser) {
      throw new Error('You must be logged in to create a quote.');
    }

    const newDoc = await addDoc(collection(db, 'quotes'), {
      userId: firebaseUser.uid,
      customerName: quoteData.customerName,
      phone: quoteData.phone,
      amount: quoteData.amount,
      quoteDate: quoteData.quoteDate,
      followUpDate: quoteData.followUpDate,
      status: quoteData.status || 'waiting',
      notes: quoteData.notes || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return newDoc.id;
  };

  const updateQuote = async (id: string, updates: Partial<Quote>) => {
    if (!firebaseUser) return;
    const quoteDocRef = doc(db, 'quotes', id);
    const updatePayload: Record<string, any> = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    // Ensure we don't accidentally send undefined or id/userId
    delete updatePayload.id;
    delete updatePayload.userId;

    await updateDoc(quoteDocRef, updatePayload);
  };

  const deleteQuote = async (id: string) => {
    if (!firebaseUser) return;
    await deleteDoc(doc(db, 'quotes', id));
  };

  const markFollowedUp = async (id: string, nextFollowUpDate: string, notesAppend?: string) => {
    if (!firebaseUser) return;
    const existing = quotes.find((q) => q.id === id);
    let newNotes = existing?.notes || null;

    if (notesAppend) {
      newNotes = existing?.notes
        ? `${existing.notes}\n[${getLocalToday()}]: ${notesAppend}`
        : `[${getLocalToday()}]: ${notesAppend}`;
    }

    const quoteDocRef = doc(db, 'quotes', id);
    await updateDoc(quoteDocRef, {
      status: 'followed_up',
      followUpDate: nextFollowUpDate || addDaysToDate(getLocalToday(), 3),
      notes: newNotes,
      updatedAt: serverTimestamp(),
    });
  };

  const updateStatus = async (id: string, status: Status) => {
    if (!firebaseUser) return;
    const quoteDocRef = doc(db, 'quotes', id);
    await updateDoc(quoteDocRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  };

  return (
    <AppContext.Provider
      value={{
        firebaseUser,
        user,
        isAuthenticated: !!firebaseUser,
        authLoading,
        quotes,
        quotesLoading,
        logout: authLogout,
        updateProfile: updateProfileData,
        addQuote,
        updateQuote,
        deleteQuote,
        markFollowedUp,
        updateStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
