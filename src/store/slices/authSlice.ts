import { userLogin$ } from '@/providers/event.service';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppDispatch } from '@/store/store';
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
    _setCredentials: (state, action: PayloadAction<{ token: string }>) =>  {
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

const { _setCredentials } = authSlice.actions;

/**
 * Thunk that updates auth state then signals login to subscribers.
 * Using a thunk ensures userLogin$.next() is called after the reducer
 * completes, preventing Redux Error #9 (nested dispatch).
 */
export const setCredentials = (payload: { token: string }) => (dispatch: AppDispatch) => {
  dispatch(_setCredentials(payload));
  userLogin$.next({});
};

export const { logout, setUnVerifiedToken } = authSlice.actions;
export default authSlice.reducer;