"use client";
import GoogleAuthButton from "@/components/ui/buttons/GoogleAuthButton";
import { auth } from "@/config/firebase";
import { saveSesion } from "@/redux/features/auth/authSlice/auth";
import { useAppSelector } from "@/redux/hooks";
import { registerUserHandler } from "@/utils/firestoreUtils";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { useDispatch } from "react-redux";

export default function Home() {
  const [signInWithGoogle, _user, _loading, _error] = useSignInWithGoogle(auth);
  const router = useRouter();
  const user = useAppSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    onAuthStateChanged(auth, async (userAuth) => {
      if (userAuth && userAuth.email) {
        await registerUserHandler(userAuth.email, userAuth.photoURL || "");
        dispatch(
          saveSesion({
            loading: false,
            userInfo: {
              email: userAuth.email,
              uid: userAuth.uid,
            },
            userToken: userAuth.refreshToken,
            success: true,
          })
        );
      }
    });
  }, [dispatch, _user]);

  if (user && user.success) router.push("/projects");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-orange-40">
      <div
        className="w-96 h-96 rounded-[50%] bg-red-400 fixed -top-24 -right-24 opacity-10 "
        style={{ borderRadius: "78% 22% 53% 29% / 78% 22% 53% 29%" }}
      />
      <div className="w-96 h-96 rounded-[50%] bg-red-400 fixed top-20 -left-56 opacity-10" />
      <div
        className="w-96 h-96 bg-red-400 fixed -bottom-48  opacity-10 rotate-12"
        style={{ borderRadius: "78% 22% 53% 29% / 78% 22% 53% 29%" }}
      />

      <div className="w-10/12 flex flex-col justify-center items-center gap-4">
        <h2 className="text-center">
          <span className="text-6xl font-extrabold text-gray-800">
            Trabaja por tus sueños a diario y conviertelos en una
          </span>
          <span className="text-6xl font-extrabold text-primary text-red-600">
            {" "}
            realidad
          </span>
        </h2>
        <h3 className="w-9/12 text-center text-gray-700 ">
          Un sistema web que te ayudará a organizar tus objetivos en pequeñas
          tareas periodicas y obtener un reporte de tu avance cuando desees.
          Alcanzar tus metas nunca fue tan facil.
        </h3>
        <div className="flex flex-row items-center gap-2">
          <p className="text-gray-700 font-semibold">¿Qué esperas?</p>
          {!_user && (
            <GoogleAuthButton
              text="Comienza con Google"
              onLogin={() => signInWithGoogle()}
            />
          )}
        </div>
      </div>
    </main>
  );
}
