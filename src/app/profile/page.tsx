"use client";
import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import React from "react";

const Profile = () => {
  const userLoged = useAppSelector((state) => state.auth);
  const router = useRouter();

  // if (!userLoged.success) router.push("/");

  return <div>Profile</div>;
};

export default Profile;
