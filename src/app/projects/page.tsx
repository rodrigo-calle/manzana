"use client";
import { useAppSelector } from "@/redux/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

const Projects = () => {
  const userLoged = useAppSelector((state) => state.auth);
  const router = useRouter();

  if (!userLoged.success) router.push("/");

  return (
    <div className="pt-10">
      <h1>Projects</h1>
      <Link href="/profile">Profile</Link>
    </div>
  );
};

export default Projects;
