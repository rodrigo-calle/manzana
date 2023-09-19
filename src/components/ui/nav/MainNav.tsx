"use client";
import Image from "next/image";
import { getUser } from "@/config/authentication";
import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/config/firebase";

const MainNav = () => {
  const [user, loading, error] = useAuthState(auth);
  
  return (
    <nav className="w-full h-14 border-b-slate-400 fixed top-0 flex flex-row items-center justify-center">
      <Link href={"/"} className="cursor-pointer">
        <div className="flex flex-row items-center w-11/12">
          <Image
            src="/images/apple.png"
            width={32}
            height={32}
            alt="manzanita"
          />
          <h1 className="text-slate-800 font-bold text-lg mt-2">Manzana</h1>
        </div>
      </Link>
      <div className="flex flex-row items-center w-11/12 justify-end">
        {/* {user && (
          <div className="flex flex-row items-center gap-2">
            <Image
              src={user.photoURL!}
              width={32}
              height={32}
              alt="profile"
              className="rounded-full"
            />
            <p className="text-slate-800 font-semibold">{user.displayName}</p>
          </div>
        )} */}
      </div>
    </nav>
  );
};

export default MainNav;
