import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase";
const provider = new GoogleAuthProvider();

auth.languageCode = 'es';

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider)
        const credential = GoogleAuthProvider.credentialFromResult(result)
        console.log({credential, result})
        if(credential === null) {
            throw new Error('No se pudo obtener la credencial')
        }
        const user = {
            uid: result.user?.uid,
            displayName: result.user?.displayName,
            email: result.user?.email,
            photoURL: result.user?.photoURL,
            accessToken: credential.accessToken
        }
        console.log({user})
        const userQuerySnap = query(collection(db, 'users'), where('email', '==', user.email))
        const userQuerySnapList = await getDocs(userQuerySnap)

        if(userQuerySnapList.empty) {
            await addDoc(collection(db, 'users'), user)
        }

        return user.uid 
    } catch (error) {
        console.log(error)
        // console.log({x: error.code, y: error.message})
        throw new Error('Ocurrió un error')
    }
}