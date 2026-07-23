import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import your reducers
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import appReducer from './slices/appSlice';
import { setCredentials } from './slices/authSlice';
import { userLogin$ } from '@/providers/event.service';

// Listener middleware to handle post-login side effects outside the reducer
const listenerMiddleware = createListenerMiddleware();
listenerMiddleware.startListening({
  actionCreator: setCredentials,
  effect: () => {
    // Emit asynchronously so the reducer has fully completed before any
    // subscriber can trigger further dispatches (avoids Redux Error #9).
    setTimeout(() => {
      userLogin$.next({});
    }, 0);
  },
});
//import { Storage } from '@ionic/storage';

//const storage = new Storage();
  
export type StoreState = {
  auth: ReturnType<typeof authReducer>;
  user: ReturnType<typeof userReducer>;
  app: ReturnType<typeof appReducer>;
}

const loadState = () => {
  try {
   //await storage.create();
   //const serializedState = await storage.get('state');
    const serializedState = localStorage.getItem('state');
    if (!serializedState) 
      return undefined
    return JSON.parse(serializedState)
  } catch (err) {
    return undefined
  }
}
 
export const store = configureStore<StoreState>({
  preloadedState: loadState(),
  reducer: {
    auth: authReducer,
    user: userReducer,
    app: appReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

// Save to local storage
store.subscribe(async () => {
   
  const state = {
    ...store.getState(),
    app: {
      ...store.getState().app,
      canGoForward: false,
      path: ""
    }
  };

  localStorage.setItem('state', JSON.stringify(state));
  
  /*await storage.set('state',   
      JSON.stringify(state)
    ) 
  }*/
});

// Types for hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;