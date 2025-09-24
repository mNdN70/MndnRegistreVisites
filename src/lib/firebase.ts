'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'studio-6638906933-56dae',
  appId: '1:1010390430341:web:4b9f5326353e6c2da22fec',
  apiKey: 'AIzaSyCSX3ybx1NUc3ph2gPuZumnhhoXdlM_p_U',
  authDomain: 'studio-6638906933-56dae.firebaseapp.com',
  measurementId: 'G-1WP9321K3G',
  messagingSenderId: '1010390430341',
  storageBucket: 'studio-6638906933-56dae.appspot.com',
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
