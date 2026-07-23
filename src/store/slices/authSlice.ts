import { createSlice, PayloadAction } from '@reduxjs/toolkit';
//import { cookies } from 'next/headers';
//import Cookies from 'js-cookie';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  unVerifiedToken: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  unVerifiedToken: null,
};

//const cookieStore = await cookies();
        
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string }>) =>  {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      /*cookies().then(cookieStore => {
        cookieStore.set('isAuthenticated', 'true');
      });*/

      //Cookies.set('isAuthenticated', "1");
      
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      /*cookies().then(cookieStore => {
        cookieStore.delete('isAuthenticated');
      });*/

      //Cookies.remove('isAuthenticated');
    },
    setUnVerifiedToken: (state, action: PayloadAction<{ token: string | null }>) => {
      state.unVerifiedToken = action.payload.token;
    },
  },
});

export const { setCredentials, logout, setUnVerifiedToken } = authSlice.actions;
export default authSlice.reducer;