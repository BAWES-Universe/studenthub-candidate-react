

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { Link, useHistory } from "react-router-dom";
import Spinner from "../common/spinner";
import { useEffect, useState } from "react";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { useGoogleIdTokenForAuth, startUniverseLogin } from "@/providers/auth.service";
import { setCredentials } from "@/store/slices/authSlice";
import { setIsProfileCompleted } from "@/store/slices/userSlice";
import { useTranslation } from "react-i18next";
import { alertDialog } from "@/hooks/use-alert-dialog";
import { Script } from "@/utils/script";
 
//import Rocket from '../../public/'; // Adjust the path as necessary

export function Hero() {

  const { isAuthenticated } = useAppSelector(state => state.auth) as { isAuthenticated: boolean };
  
  const dispatch = useAppDispatch();
  const router = useHistory();
  const [googleLoginLoading, setGoogleLoginLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    //router.prefetch("/home");
    //router.prefetch("/name");
  }, []);

  const loginByGoogle = () => {
    setGoogleLoginLoading(true);

    GoogleAuth.signIn().then(async googleUser => {
 
      if (googleUser && googleUser.authentication && googleUser.authentication.idToken) {
        const res = await useGoogleIdTokenForAuth(googleUser.authentication.idToken);
 
        if (res.operation == 'success') {
          // After successful login

          dispatch(setIsProfileCompleted({ 
            isProfileCompleted: res.isProfileCompleted
          }));
    
          dispatch(setCredentials({
            token: res.token
          }));

          //todo: set language based on saved preference?
          //language_pref

          router.push('/home');

        } else {
          alertDialog({
            title: t('Error'),
            description: res.message
          });
        }
      } else {
        alertDialog({
          title: t('Error'),
          description: t('Error getting login by Google')
        });
      }
    }).catch(async err => {
 
      if (err = 'popup_closed_by_user') {
         
        /*alertDialog({
          title: t('Error'),
          description: t(err)
        });*/
        return false;
      }

      alertDialog({
        title: t('Error'),
        description: t('Error getting login by Google')
      });
      
    }).finally(() => {
      setGoogleLoginLoading(false);
    });
  }

  useEffect(() => {
   
    // Redirect if authenticated
    if (isAuthenticated) {
      return router.push('/home');
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        router.push("/name");
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    GoogleAuth.initialize({
      clientId: '123188361193-od1ehqo4c35cle8mtplqetoenussu650.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (

    <div className="flex  min-h-screen flex-col items-center  text-center px-4 p-[16px]">

      <div className="w-[240px] h-[240px] bg-[#f9f9f9] rounded-[118px] flex justify-center items-center mb-[40px] xs:mt-[87px] sm:mt-[40px]">
        <img alt="" src="/assets/icons/rocket.svg" className="w-[128px] h-[128px]" />
      </div>
      
      <h1 className="font-bold tracking-tighter xs:text-[20px] sm:text-[40px]">
        {t('Ready for a whole new adventure?')} <br />
        {t("Let's get you working!")}
      </h1>
      
      <Button variant="outline" size="lg" disabled={googleLoginLoading} onClick={() => loginByGoogle()} 
          className=" sm:w-[300px] h-[56px] mt-8">
          { googleLoginLoading && <Spinner />}
          { !googleLoginLoading && <>
              <img src='/assets/images/google.svg' />{t("Log in with Google")}</> 
          }
        </Button>

      <Button variant="outline" size="lg" onClick={() => startUniverseLogin()}
          className=" sm:w-[300px] h-[56px] mt-4">
          <img src='/assets/images/icon-bawes.svg' className="w-5 h-5" />{t("Continue with Universe")}
      </Button>
        
      <div className={ `xs:flex sm:block xs:bottom-[76px] ${window.innerHeight >= 780 ? 'xs:fixed' : 'mt-4'} sm:bottom-auto sm:mt-8 sm:relative font-semibold text-base `}>
        
        <Link to="/name">
          <Button size="lg" className=" sm:w-[300px] h-[56px]">
            {t("Let's do it!")}
          </Button>
        </Link>
                
        <p className="mt-[8px] xs:hidden sm:block">{t('Enter ↵')}</p> 
      </div>

      <div className={ `${window.innerHeight >= 780 ? 'xs:fixed' : 'mt-4'} xs:bottom-[16px] sm:mt-12 sm:relative  space-y-2 text-sm text-muted-foreground` }>
        <p>
          {t('Have an account?')}{" "}
          <Link to="/login" className="no-underline text-primary">
            {t('Login')}
          </Link>
        </p>
        <p>
          {t('Need help?')}{" "}
          <Link to="/contact" className="no-underline text-primary">
            {t('Contact Us')}
          </Link>
        </p>
      </div>

      <Script
          src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js" // Replace with your script URL
          strategy="lazyOnload" 
          onLoad={() => {
         }}
        />
    </div>
  );
}