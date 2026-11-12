import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFunctions, httpsCallable, type Functions } from 'firebase/functions';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const config={
  apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  appId:import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId:import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
};
export const configured=Boolean(config.apiKey&&config.projectId&&config.appId&&config.authDomain);
export const app:FirebaseApp|null=configured?(getApps()[0]||initializeApp(config)):null;
export const auth:Auth|null=app?getAuth(app):null;
export const db:Firestore|null=app?getFirestore(app):null;
export const functions:Functions|null=app?getFunctions(app,'southamerica-east1'):null;
export const storage:FirebaseStorage|null=app?getStorage(app):null;
export async function guest(){
  if(!auth)throw new Error('Firebase não configurado.');
  if(auth.currentUser)return auth.currentUser;
  return (await signInAnonymously(auth)).user;
}
export async function call<T=unknown>(name:string,data:unknown):Promise<T>{
  if(!functions)throw new Error('Firebase Functions ainda não configurado.');
  await guest();
  return (await httpsCallable<unknown,T>(functions,name)(data)).data;
}
