import {PayloadAction, createSlice} from '@reduxjs/toolkit'

type InitialState = {
    email: string | null;
    uid: string | null;
}

const initialState: InitialState = {
    email: null,
    uid: null
}

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        saveSesion: (state, action: PayloadAction<InitialState>) => {
            state.email = action.payload.email
            state.uid = action.payload.uid
        },
        removeSesion: (state, action: PayloadAction<InitialState>) => {
            state = initialState
        },
    }
})

export const { saveSesion, removeSesion} = userSlice.actions;
export default userSlice.reducer;