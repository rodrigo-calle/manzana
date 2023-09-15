import { GoogleAuthProvider, User, signInWithPopup } from "firebase/auth";
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
        const userQuerySnap = query(collection(db, 'users'), where('email', '==', user.email))
        const userQuerySnapList = await getDocs(userQuerySnap)

        if(userQuerySnapList.empty) {
            await addDoc(collection(db, 'users'), user)
        }
        return user.uid 
    } catch (error: any) {
        throw new Error('Ocurrió un error' + error.message)
    }
}

export const getUser = async (): Promise<null | User> => {
    try {
        const tokenId = await auth.currentUser?.getIdToken()

        if(!tokenId) {
            return null
        }

        const user = auth.currentUser
        
        if(!user) {
            throw new Error('No se pudo obtener el usuario')
        }
        return user
    } catch (error: any) {
        throw new Error('Ocurrió un error' + error.message)
    }
}

export const logout = async() => {
    await auth.signOut()
}