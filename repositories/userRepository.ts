import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config"; // Usa sempre o 'db' do cliente
import { User } from "@/types/users/users";

export class UserRepository {
  // Não precisa mais de constructor

  async create(userId: string, userData: Omit<User, 'id'>): Promise<User> {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, userData);
    const newUserDoc = await getDoc(userRef);
    return { id: newUserDoc.id, ...newUserDoc.data() } as User;
  }

  async findById(id: string): Promise<User | null> {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as User;
  }
  
  // Este método não será mais usado pelo webhook, mas pode ser útil em outros lugares
  async update(userId: string, data: Partial<User>): Promise<void> {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, data);
  }
}