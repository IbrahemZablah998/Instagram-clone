import firebase from 'firebase';

const firebaseApp = firebase.initializeApp({
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  apiKey: "AIzaSyBO3y2mINdZkh0rwKOgLWSACyxg2n6dtTI",
  authDomain: "instagram-clone-2dc2b.firebaseapp.com",
  projectId: "instagram-clone-2dc2b",
  storageBucket: "instagram-clone-2dc2b.appspot.com",
  messagingSenderId: "385401525572",
  appId: "1:385401525572:web:8dade53f919ef30b6a7311",
  measurementId: "G-HBSVZY883S"
});

const db = firebaseApp.firestore();
const auth = firebaseApp.auth();
const storage = firebaseApp.storage();

export { db, auth, storage };