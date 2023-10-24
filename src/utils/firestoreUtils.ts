import { db } from "@/config/firebase";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

export const registerUserHandler = async (
  email: string,
  avatar: string
): Promise<void> => {
  const users = collection(db, "users");
  const q = query(users, where("email", "==", email));
  const userSnap = await getDocs(q);

  if (userSnap.empty) {
    await addDoc(users, {
      email,
      profile: {
        name: "",
        avatar,
      },
    });
  }
};
