import { DocumentReference, Timestamp } from "firebase/firestore";

export interface Profile {
  name: string;
  lastName: string;
  age: number;
  address: string;
  phone: string;
  email: string;
  photo: string;
}

type TaskList = {
  name: string;
  description: string;
  createdAt: Timestamp;
}[];
export interface User {
  email: string;
  profile: Profile;
}

export interface ActivitySubcollection {
  activities: TaskList;
  notes: string;
  media: Array<{
    url: string;
    type: string;
  }>;
  date: Timestamp;
}

export interface Project {
  user: DocumentReference;
  name: string;
  description: string;
  createdAt: string;
  tasks: TaskList;
}
