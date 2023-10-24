import { DocumentReference } from "firebase/firestore";

export interface Profile {
  name: string;
  lastName: string;
  age: number;
  address: string;
  phone: string;
  email: string;
  photo: string;
}

export interface User {
  email: string;
  profile: Profile;
}
