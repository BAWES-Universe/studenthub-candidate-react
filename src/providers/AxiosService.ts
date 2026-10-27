import { store } from '@/store/store'; 
import axios from 'axios';
//import { map } from 'zod';
import { saveAs } from 'file-saver';
import { error404$, error500$, internetOffline$, userLogout$ } from './event.service';

//https://axios-http.com/docs/req_config

/*if(store.state['store'] && store.state['store'].is_sandbox) {
    axios.defaults.baseURL = "https://api.dev.plugn.io/v2";
} else {
    axios.defaults.baseURL = import.meta.env.VITE_APP_ENDPOINT;
}*/

axios.defaults.baseURL = import.meta.env.VITE_API_ENDPOINT;

axios.defaults.headers.patch['Content-Type'] = 'application/x-www-form-urlencoded'; 
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

// Add a request interceptor
axios.interceptors.request.use((config) => {  
    
    // const { isAuthenticated, token } = useAppSelector((state: RootState) => state.auth);
   
    const state = store.getState(); // Get the state directly from the store

    const { isAuthenticated, token } = state.auth; // Access auth state
    const { language, mixpanel_distinct_id } = state.app; // Access app state

    if(isAuthenticated) {
        config.headers['Authorization'] = 'Bearer ' + token;
    } else {
        console.log("no authorization token");
    }

    config.headers['Language'] = language;
    config.headers['Mixpanel-Distinct-ID'] = mixpanel_distinct_id;

    return config;
});

axios.interceptors.response.use(async (response) => {
    return response;
}, err => handleAxiosError(err));

export async function handleAxiosError(err: any) {
    
    console.log("axios error:", err);

    const response = err.response;
    const localErrorHandler = Boolean(err.config?.localErrorHandler);
    //const errMsg = response.status ? `${response.status} - ${response.statusText}` : 'Server error';

    if (!response) {
        if (!localErrorHandler) {
            internetOffline$.next({});
        }
        return Promise.reject(err);
    }

    // Handle Bad Requests
    if (response.status === 400 && !localErrorHandler) {
        error404$.next({});
     //   Router.push('/404');   
    }

    // Handle No Internet Connection Error
    if ((response.status == 0 || response.status == 504) && !localErrorHandler) {
        internetOffline$.next({});
    //    Router.push('/no-internet');  
    }
    
    if(!navigator.onLine && !localErrorHandler) {
        internetOffline$.next({});
    //    Router.push('/no-internet');  
    }

    // Handle Expired Session Error
    if (response.status === 401) { 
        //const dispatch = useAppDispatch();
        //dispatch(logout());
        //    Router.push('/'); 
        userLogout$.next({});
    }

    // Handle internal server error - 500  
    if (response.status === 500 && !localErrorHandler) {
        console.error(JSON.stringify(response));
        error500$.next({});
    //    Router.push('/500');   
    }

    // Handle page not found - 404 error 
    if (response.status === 404 && !localErrorHandler) {
        error404$.next({});
    //    Router.push('/404');   
    }

    /*if (error.status === 418) {
        eventService.error418$.next();
        return empty();
    }

    if (error.status === 419) {
        eventService.error419$.next();
        return empty();
    }

    if (error.status === 420) {
        eventService.error420$.next();
        return empty();
    }

    if (error.status === 427) {
        eventService.error427$.next();
        return empty();
    }*/

    
    return Promise.reject(err);//errMsg
}

/**
   * Requests via PDF GET verb
   * @param {string} endpointUrl
   * @param {string} filename
   * @returns {Observable<any>}
   */
export async function pdfget(endpointUrl: string, filename: string): Promise<any> {
     
    await axios.get(endpointUrl, {
      responseType: 'blob', // ResponseContentType.Blob,  https://github.com/angular/angular/issues/18654#issuecomment-321947661
    }).then((async (response) => { // download file
          var blob = new Blob([response.data], { type: 'application/pdf' });
          // file name to dowanload/generate invoice

          /*if (this.platform.is('capacitor')) { //this.platform.is('ios') && 
           
            const base64 = await this.convertBlobToBase64(blob);
            
            await this.fileWrite(base64, filename)
            
          } else {*/
            saveAs(blob, filename);
          //}
        })
    );
  }


export default axios;
