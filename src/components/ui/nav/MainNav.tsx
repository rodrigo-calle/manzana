"use client";
import Image from "next/image";
import { getUser } from "@/config/authentication";
import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/config/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdownMenu/DropdownMenu";
import { useDispatch } from "react-redux";
import { removeSesion } from "@/redux/features/auth/authSlice/auth";
import { useRouter } from "next/navigation";

const MainNav = () => {
  const [user, _loading, _error] = useAuthState(auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSignOut = () => {
    dispatch(removeSesion({}));
    auth.signOut().then(() => router.push("/"));
  };

  return (
    <nav className="w-full h-14 border-b-slate-400 fixed top-0 flex flex-row items-center justify-center bg-white">
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
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="border-none border-white">
              <div className="flex flex-row items-center justify-center gap-2">
                <Image
                  src={user.photoURL!}
                  width={45}
                  height={45}
                  alt="profile"
                  className="rounded-full"
                />
                <p className="text-slate-800 font-semibold"></p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-8 rounded-md">
              <DropdownMenuLabel onClick={() => router.push('/profile')}>Mi Perfil</DropdownMenuLabel>
              <DropdownMenuLabel onClick={() => router.push('/projects')}>Mis Proyectos</DropdownMenuLabel>
              <DropdownMenuSeparator className="w-10 border-b-slate-500" />
              <DropdownMenuLabel
                className="cursor-pointer"
                onClick={() => handleSignOut()}
              >
                Cerrar Sesión
              </DropdownMenuLabel>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
};

export default MainNav;
