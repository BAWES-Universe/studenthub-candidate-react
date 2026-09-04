

import { Suspense, useEffect, useRef, useState } from "react";
import { useIonRouter } from "@ionic/react";
import { useTranslation } from "react-i18next";
import { setCredentials, setUnVerifiedToken } from "@/store/slices/authSlice";
import { setIsProfileCompleted } from "@/store/slices/userSlice";
import { useAppDispatch } from "@/store/store";
import { useUniverseCodeForAuth, consumeUniverseLoginState } from "@/providers/auth.service";
import { page, track } from "@/providers/analytics.service";
import { errorMessage, useQuery } from "@/utils/common";
import { alertDialog } from "@/hooks/use-alert-dialog";
import AuthLayout from "../layout";
import Loading from "./loading";

/**
 * OAuth callback route for the "Continue with Universe" (Authentik OIDC)
 * login flow. Authentik redirects the browser here with a one-time `code`
 * (never an id_token/access_token). The code is forwarded to the backend
 * (POST /auth/login-by-universe) which performs the actual token exchange
 * and returns a StudentHub bearer token — the same response shape as
 * /auth/login (see login page handling).
 */
export default function AuthCallbackPage() {

  const router = useIonRouter();

  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const query = useQuery();

  const [loading, setLoading] = useState(false);

  const hasRun = useRef(false);

  useEffect(() => {

    page('Auth Callback Page');

    return () => {
        track('page_exit', { page: 'Auth Callback Page' });
    }
  }, []);

  useEffect(() => {

    if (hasRun.current)
      return;

    hasRun.current = true;

    const code = query.get('code');
    const state = query.get('state');
    const error = query.get('error');

    // Read + clear the state stored when the flow was started. Consumed on
    // every terminal path below so a stale value can't leak into a later flow.
    const storedState = consumeUniverseLoginState();

    // Authentik bounces back with ?error=... when the user cancels or the
    // request was rejected — nothing to exchange in that case.
    if (error || !code) {
      alertDialog({
        title: t('Unable to Log In'),
        description: error ? error : t('Sign-in could not be completed. Please try again.'),
      });
      router.push('/login');
      return;
    }

    // Verify the state matches the value stored when the flow was started
    // (protects against login-CSRF). When nothing was stored (e.g. the
    // callback page was reloaded after the Authentik redirect) skip the
    // check and let the backend re-validate the single-use code.
    if (storedState && (!state || state !== storedState)) {
      alertDialog({
        title: t('Unable to Log In'),
        description: t('Sign-in could not be completed. Please try again.'),
      });
      router.push('/login');
      return;
    }

    setLoading(true);

    const redirectUri = import.meta.env.VITE_AUTHENTIK_REDIRECT_URI || window.location.origin + '/auth/callback';

    useUniverseCodeForAuth(code, state ?? '', redirectUri).then(res => {

      if (res.operation != 'success') {

        if (res.errorType == 'email-not-verified') {

          dispatch(setUnVerifiedToken({
            token: res.unVerifiedToken
          }));

          if (res.email) {
            const url = '/verify-email/' + res.email + '?fromProfile=1';
            router.push(url);
          } else {
            alertDialog({
              title: t('Verify your email'),
              description: t('Please check your email address and verify it before logging in.'),
            });
            router.push('/login');
          }

        } else {
          alertDialog({
            title: t('Error'),
            description: errorMessage(res.message),
          });
          router.push('/login');
        }

      } else if (res.token_status == 0) {

        router.push('/login-two-step/' + res.token);

      } else {

        // After successful login
        dispatch(setCredentials({
          token: res.token
        }));

        dispatch(setIsProfileCompleted({ 
          isProfileCompleted: res.isProfileCompleted
        }));

        router.push('/home');
      }

    }).catch(err => {
      alertDialog({
        title: t('Unable to Log In'),
        description: t('There seems to be an issue connecting to Payroll servers. Please contact us if the issue persists.'),
      });
      router.push('/login');
    }).finally(() => {
      setLoading(false);
    });

  }, []);

  return (
    <Suspense fallback={<Loading />}>
      <AuthLayout>
        <div className="bg-[#fff] min-h-[60vh] flex flex-col items-center justify-center text-center">
          { loading && (
            <>
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
              <p className="mt-6 text-base font-semibold leading-6 text-[#4B4B61]">
                {t('Signing you in...')}
              </p>
            </>
          )}
        </div>
      </AuthLayout>
    </Suspense>
  );
}
