

import { Hero } from "@/components/on-board/hero";
import AuthLayout from "../layout";
import { useEffect, useRef, useState } from "react";
import { loginByKey } from "@/providers/auth.service";
import { setIsProfileCompleted } from "@/store/slices/userSlice";
import { setCredentials } from "@/store/slices/authSlice";
import { userLogin$ } from "@/providers/event.service";
import { useAppDispatch } from "@/store/store";
import { useIonRouter } from "@ionic/react";
import { useQuery } from "@/utils/common";
//import { logout } from "@/store/slices/authSlice";
//import { useEffect } from "react";
//import { useIonRouter } from '@ionic/react';

export default function LandingPage() {
 
  //const { isAuthenticated } =  useAppSelector((state: any) => state.auth);

  const dispatch = useAppDispatch();
  
  const router = useIonRouter();

  const [loading, setLoading] = useState(false);
  
  const query = useQuery();

  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) 
      return;

    hasRun.current = true;
 
    if(query.get('auth_key') && !loading) {
 
      setLoading(true);

      loginByKey(query.get('auth_key') + '').then(res => {
 
        //setAuthKey(null);

        // After successful login
        dispatch(setCredentials({
          token: res.token
        }));
        userLogin$.next({});
  
        dispatch(setIsProfileCompleted({ 
          isProfileCompleted: res.isProfileCompleted
        }));
   
        //todo: set language based on saved preference?
        //language_pref
  
        router.push('/home');
        
      }).catch(err => {
       // alert("err:" + err);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, []);
 
  return <AuthLayout>  
    <Hero /> 
  </AuthLayout>;
}
