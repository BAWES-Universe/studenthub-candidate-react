import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import axios from "./AxiosService";
import { store } from '@/store/store';

declare let AppleID: any;

/**
 * return user location detail by user ip address
 * @return Observable
 */
export async function locate(): Promise<any> {
  const url = `/auth/locate`;
  const response = await axios.get(url);
  return response.data;
}

/**
 * Login by key
 * @param auth_key
 * @returns
 */
export async function loginByKey(auth_key: string) {
  const response = await axios.post('/auth/login-by-key', {
    auth_key: auth_key
  });
  return response.data;
}

/**
 * Login by Auth0 accessToken
 */
export async function useTokenForAuth(accessToken: string) {

  const state = store.getState(); // Get the state directly from the store

  const { utm_uuid } = state.app;  
 
  const response = await axios.post('/auth/login-auth0', {
    accessToken,
    utm_uuid: utm_uuid
  });
  return response.data;
}

/**
 * Set language pref for current user
 *
export async function setLanguagePref(language_pref: string) {
  const dispatch = useAppDispatch();

  dispatch(setLanguage({
    language: language_pref
  }));
}*/

/**
 * Update password by token got in email
 * @param password
 * @param token
 */
export async function updatePassword(password: string, token: string) {
  const response = await axios.patch("/auth/update-password", {
    newPassword: password, 'token': token
  });
  return response.data;
}

/**
 * Get user arabic name from civil id
 * @param civilId e.g., 289100500862
 */
export async function getNameByCivilId(civilId: string) {

  const formData = 'ctl00%24ScriptManager1=ctl00%24ContentPlaceHolder1%24UpdatePanel1%7Cctl00%24ContentPlaceHolder1%24txtCivilID&ctl00%24ContentPlaceHolder1%24txtCivilID=' + civilId + '&ctl00%24ContentPlaceHolder1%24txtName=%D8%AF%D9%84%D8%A7%D9%84%20%D8%B4%D9%81%D9%8A%D9%82%20%D8%A3%D9%85%D9%8A%D9%86%20%D8%A7%D9%84%D8%B9%D9%88%D8%B6%D9%89&ctl00%24ContentPlaceHolder1%24txtLicnCivilID=&ctl00%24ContentPlaceHolder1%24txtEmail=&ctl00%24ContentPlaceHolder1%24txtPhone=&ctl00%24ContentPlaceHolder1%24txtPass=&ctl00%24ContentPlaceHolder1%24txtConfPass=&__EVENTTARGET=ctl00%24ContentPlaceHolder1%24txtCivilID&__EVENTARGUMENT=&__LASTFOCUS=&__VIEWSTATE=5SQDJO72YdvfQaFUQ%2Fts5QUW1TILOsHPq21QH9%2B0%2F53iXEpP%2BdhPA9TDriUURvMbWtYWqD0a65zRcQhdaxtJ3cF%2Fl4QxUKFlNKVkdQlsI%2B6h82G8yJNO1YfBWGlnkqF8eynDLvvQ09rnGQyyKY9St8LJjqdQ1qab2RUdkWQ50lpiG3M8%2BgXzgMQ%2FL6iAgKN%2BGhFMGagmAwjW5n0xpvHg1a4rhnZyn%2FbCTF7hDLLH%2FV8nRU%2BvRBWA641dh9SDwwjM3YzS1rKpgewFR%2BE097ywxJqfiMWuGSPZT%2FdzHaLx4JU%2B%2Fh7Bz8q4F%2FOvRU%2Beq%2BU8IlsWqmncxna6%2FCccSqd%2FYACh1KvxuWJUF62TY7c5nfat4J8tZ5bj1Qoolib6AnHNYdoFx%2BdakMb0ejXRPJABUJnO3mJ3o88Mih687kGHJzQ%3D&__VIEWSTATEGENERATOR=2945D545&__EVENTVALIDATION=aHQjT5qABVnpLuxYv5ewcvYGLCQEzumzLYzmyMBJ%2BJZtlAvu7Q4L5C3Q7ekL4HdolATaN0bKximOBaMftgwUfUyA8Ylssm%2FgfU%2F%2FL81kHi%2FWx2ZM1fe6cA0GPiZonC1s7fqWBtJAC4Fxm%2F%2F8Weua2lVXL71MYy0d7vp7sdn9mnFu6I8rdaTxOWg9PJf%2BS1RI2DMTYs1%2BCiknEGVkKnAVXbrn7DmFfLCsGF6sJgpN2FVtwDWMfOz0970hA%2F8kD5xJvVJo3G3oc1ZtirDEFGyNCA%3D%3D&__ASYNCPOST=true&';

  const response = await axios
    .create({
      headers: {
        'authority': 'eapp.moci.gov.kw',
        'cache-control': 'no-cache',
        'x-requested-with': 'XMLHttpRequest',
        'x-microsoftajax': 'Delta=true',
        //'user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36'
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        accept: '*/*',
        'Content-Type': 'text/html',
        'origin': 'https://eapp.moci.gov.kw',
        //'sec-fetch-site':'same-origin',
        //'sec-fetch-mode':'cors',
        //'sec-fetch-dest': 'empty',
        'referer': 'https://eapp.moci.gov.kw/eapp/WebPages/signup.aspx',
        //'accept-language':'en-US,en;q=0.9,ar;q=0.8',
        //'cookie': 'ASP.NET_SessionId=ny0w5j0edr2fzrn2rso31ltg'
      },
      responseType: 'text',
      baseURL: 'https://eapp.moci.gov.kw/eapp/WebPages/signup.aspx'
    })
    .post("", formData);
  return response.data;
}

/**
 * Verify email
 * @param email
 * @param code
 */
export async function verifyEmail(email: string, code: string): Promise<any> {
  const response = await axios.post("/auth/verify-email", { email: email, code: code });
  return response.data;
}

/**
 * Check if email already verified
 * @param res
 */
export async function isAlreadyVerified(res: any): Promise<any> {
  const response = await axios.post("/auth/is-email-verified", res);
  return response.data;
}

/**
 * Resend verification email
 * @param email
 */
export async function resendVerificationEmail(email: string, token: string = '') {
  const response = await axios.post("/auth/resend-verification-email", {
    'email': email, 'token': token
  });
  return response.data;
}

/**
 * Update email address
 * @param params params
 */
export async function updateEmail(params: any): Promise<any> {
  const response = await axios.post("/auth/update-email", params);
  return response.data;
}

export async function loginTwoStep(grecaptchaToken: string, token: string, otp: string): Promise<any> {
  const response = await axios
    .create({
      headers: {
        'g-recaptcha-response': grecaptchaToken
      } 
    })
    .post("/auth/login-two-step", {
      token: token,
      otp: otp
    });

  return response.data;
}

/**
 * Basic auth, exchanges access details for a bearer access token to use in
 * subsequent requests.
 * @param  {string} email
 * @param  {string} password
 * @param  {string} token
 */
export async function basicAuth(email: string, password: string, token: string): Promise<any> {
  // Add Basic Auth Header with Base64 encoded email and password
//encodeURIComponent(
  const response = await axios
    .create({
      headers: {
        Authorization: 'Basic ' + btoa(`${email}:${password}`),
        'g-recaptcha-response': token
      },
      params: {
      //  token: token
      }
    })
    .get("/auth/login");

  return response.data;
}

/**
 * mobile check
 * @param form
 */
export async function mobileCheck(form: any): Promise<any> {
  const respone = await axios.post("/auth/email-check", form);
  return respone.data;
}

/**
 * create new account
 * @param form
 */
export async function createAccount(form: any): Promise<any> {
  
  const state = store.getState(); // Get the state directly from the store

  const { utm_uuid } = state.app;  

  const respone = await axios.post("/auth/register", {
    ...form,
    'utm_uuid': utm_uuid
  });
  return respone.data;
}

/**
 * reset password request to sms recovery link 
 * @param email
 */
export async function resetPasswordSMS(email: string) {
  const respone = await axios.post("/auth/sms-reset-password", {
    'email': email
  });
  return respone.data;
}

/**
 * reset password request
 * @param email
 */
export async function resetPasswordRequest(email: string, token: string = '') {
  const respone = await axios.post("/auth/request-reset-password", {
    'email': email, 'token': token
  });
  return respone.data;
}

/**
 * login with AppleJS for PWA
 */
export async function loginByAppleJs() {

  //this.appleAuthLoading = true;

  try {

    const data = await AppleID.auth.signIn();

    let params;

    if (data.user && data.user.familyName) {

      params = {
        identityToken: data.authorization.id_token,
        email: data.user.email,
        familyName: data.user.name.familyName,
        givenName: data.user.name.givenName
      };
    }
    else {
      params = {
        identityToken: data.authorization.id_token
      }
    }

    handleAppleLoginResponse(params);

  } catch (error) {
    console.error(error);
    // popup_closed_by_user
    // this.appleAuthLoading = false;
  }
}

/**
 * Login by Google for mobile app
 */
function loginByGoogle() {

  GoogleAuth.signIn().then((googleUser: any) => {

    if (googleUser && googleUser.authentication && googleUser.authentication.idToken) {
      useGoogleIdTokenForAuth(googleUser.authentication.idToken);
    } else {
      //showLoginError();
      alert('Error getting login by Google+ API')
    }
  }).catch((err: any) => {

    if (err = 'popup_closed_by_user') {
      return false;
    }

    alert('Error getting login by Google+ API');
  });
}

/**
 * Login by google idToken
 */
export async function useGoogleIdTokenForAuth(idToken: string) {

  const state = store.getState(); // Get the state directly from the store

  const { utm_uuid } = state.app;  

  const respone = await axios.post("/auth/login-by-google", {
    idToken: idToken,
    utm_uuid: utm_uuid
  });
  
  return respone.data;
}

/**
 * handle response from apple login popup
 * @param data
 */
export async function handleAppleLoginResponse(data: any) {

  if (!data || !data.response || !data.response.identityToken) {
    /*this.appleAuthLoading = false;

    if(data.message && data.message.indexOf("AuthorizationError") == -1) {
      this.showLoginError(this.translate.transform(data.message));
    }*/

    return null;
  }

  useAppleIdTokenForAuth(data.response);
}

/**
 * login/sign up by apple auth code
 * @param params
 */
export async function useAppleIdTokenForAuth(params: any) {

  const state = store.getState(); // Get the state directly from the store

  const { utm_uuid } = state.app;  

  params.utm_uuid = utm_uuid;

  const respone = await axios.post('/auth/login-by-apple', params);
  return respone.data;
}

/**
 * BAWES Authentik issuer (defaults to the production auth.bawes.net instance).
 */
const AUTHENTIK_ISSUER_URL = import.meta.env.VITE_AUTHENTIK_ISSUER_URL || 'https://auth.bawes.net';

/**
 * Random opaque state value protecting the OIDC redirect from CSRF.
 */
function generateUniverseLoginState(): string {

  const bytes = new Uint8Array(16);

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Start the "Continue with Universe" login flow (Authentik OIDC,
 * authorization-code). Redirects the full browser window to the Authentik
 * authorize endpoint.
 *
 * The SPA never receives or stores an id_token/access_token — Authentik
 * redirects back to VITE_AUTHENTIK_REDIRECT_URI with a one-time `code`,
 * which the SPA forwards to the backend (POST /auth/login-by-universe)
 * for the token exchange (see /auth/callback route).
 */
export function startUniverseLogin() {

  const clientId = import.meta.env.VITE_AUTHENTIK_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_AUTHENTIK_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    console.error(
      'startUniverseLogin: missing Authentik configuration. ' +
      'Set VITE_AUTHENTIK_CLIENT_ID and VITE_AUTHENTIK_REDIRECT_URI.'
    );
    return;
  }

  const state = generateUniverseLoginState();

  // Remember the state so the /auth/callback route can verify the redirect
  // came back to the same browser session that started the flow (CSRF).
  try {
    sessionStorage.setItem('sh_universe_oauth_state', state);
  } catch (e) {
    console.error('startUniverseLogin: could not persist OAuth state', e);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state: state,
  });

  window.location.assign(`${AUTHENTIK_ISSUER_URL}/application/o/authorize/?${params.toString()}`);
}

/**
 * Read (and clear) the OAuth state stored by startUniverseLogin.
 * Returns null when no state was stored (e.g. the callback page was
 * reloaded after the Authentik redirect).
 */
export function consumeUniverseLoginState(): string | null {
  try {
    const stored = sessionStorage.getItem('sh_universe_oauth_state');
    sessionStorage.removeItem('sh_universe_oauth_state');
    return stored;
  } catch (e) {
    console.error('consumeUniverseLoginState: could not read OAuth state', e);
    return null;
  }
}

/**
 * Exchange an Authentik authorization code (received on the /auth/callback
 * route) for a StudentHub bearer token. The code exchange happens on the
 * backend; the SPA only forwards the code, state and redirect_uri.
 * @param code authorization code from the Authentik redirect
 * @param state the state value that was sent with the authorize request
 * @param redirectUri the redirect URI used for the authorize request
 */
export async function useUniverseCodeForAuth(code: string, state: string, redirectUri: string) {

  const storeState = store.getState(); // Get the state directly from the store

  const { utm_uuid } = storeState.app;

  const respone = await axios.post('/auth/login-by-universe', {
    code: code,
    state: state,
    redirect_uri: redirectUri,
    utm_uuid: utm_uuid
  });

  return respone.data;
}
