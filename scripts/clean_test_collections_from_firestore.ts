import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBEB5pdqKkkqpp9EZUvrgRiwH7Hk32R2PQ",
  authDomain: "sss-bhavya.firebaseapp.com",
  projectId: "sss-bhavya",
  storageBucket: "sss-bhavya.firebasestorage.app",
  messagingSenderId: "992742433154",
  appId: "1:992742433154:web:db338b3f268d444a966f9b",
};

async function main() {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const db = getFirestore(app);

  console.log("Fetching collections from Firestore...");
  const snap = await getDocs(collection(db, 'collections'));
  console.log(`Found ${snap.size} collection documents in Firestore.`);

  let deletedCount = 0;
  for (const d of snap.docs) {
    const data = d.data();
    const name = (data.name || '').toLowerCase();
    const slug = (data.slug || '').toLowerCase();
    const id = d.id;

    if (name.includes('test') || slug.includes('test') || name.includes('festive test')) {
      console.log(`Deleting test collection: id=${id}, name="${data.name}"`);
      await deleteDoc(doc(db, 'collections', id));
      deletedCount++;
    }
  }

  console.log(`Cleaned up ${deletedCount} test collection documents from Firestore.`);
  process.exit(0);
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
