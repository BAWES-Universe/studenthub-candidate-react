

import { OnboardProgress } from "@/components/on-board/progress";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
 
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import OnboardFooter from "@/components/on-board/layout/footer";
import SubmitButton from "@/components/ui/submit-button";
import { Suspense, useEffect, useState } from "react";
import { useParams } from "react-router-dom";  
import { resendVerificationEmail, verifyEmail } from "@/providers/auth.service";
import { errorMessage, useQuery } from "@/utils/common";
import { useAppDispatch } from "@/store/store";
import { loginWithCredentials, setUnVerifiedToken } from "@/store/slices/authSlice";
import { setIsProfileCompleted, setUser } from "@/store/slices/userSlice";
import { page, track } from "@/providers/analytics.service";
import { alertDialog } from "@/hooks/use-alert-dialog";
import { useTranslation } from "react-i18next";
import Loading from "./loading";
import { useIonRouter } from "@ionic/react";
import AuthLayout from "../../layout";
 
declare global {
  interface Window {
    grecaptcha: any;
  }
}
 
export default function VerifyEmailPage() {

  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(false);

  const router = useIonRouter();  
  const dispatch = useAppDispatch();

  //const params = useParams();
  const query = useQuery();
  
  const params = useParams() as { email: string, code: string | null };
 
  const email: string = decodeURIComponent(params.email as string); // Access the dynamic parameter
  const code: string = params.code? decodeURIComponent(params.code as string): "";

  // 1. Define your form.

  const formSchema = z.object({
    c1: z.string({
      required_error: t('Please enter code'),
    }).min(1, t('Please enter code')),
    c2: z.string({
      required_error: t('Please enter code'),
    }).min(1, t('Please enter code')),
    c3: z.string({
      required_error: t('Please enter code'),
    }).min(1, t('Please enter code')),
    c4: z.string({
      required_error: t('Please enter code'),
    }).min(1, t('Please enter code')),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "all",
    defaultValues: {
      c1: code[0] || "",
      c2: code[1] || "",  
      c3: code[2] || "",
      c4: code[3] || "",
    },
  })

  useEffect(() => {

    page('Verify Email Page');

    /*if (sparams && sparams.fromProfile)
      //router.prefetch('/profile');
    else
      //router.prefetch('/phone-number');*/

    return () => {
        track('page_exit', { page: 'Verify Email Page' });
    }
  }, []);

  function resendCode() {
    window.grecaptcha.ready(() => {
      window.grecaptcha.execute('6Lei9R4pAAAAAEJYoXxoIvP2Uu0oq8iXkCVfmy6V', {action: 'submit'}).then((token: any ) => {
         
        //todo: handle error on clicking multiple times
        resendVerificationEmail(email, token).then(res => {

          // reset timer
          //runTimer = true;
          //setTimer();
    
          /*const alert = await this.alertCtrl.create({
            message: this.translateService.errorMessage(res.message),
            buttons: [ok]
          });
          await alert.present();*/
    
          if (
            res.operation != 'success' &&
            (
              res.errorCode == 1 || // if email already verified
              res.errorCode == 3 // account not founnd
            )
          ) {
            router.push('/');
          }
        });
      });
    });  
  }

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    
    setLoading(true);

    const code = values.c1 + values.c2 + values.c3 + values.c4;

    verifyEmail(email, code).then(res => {
      
      if (res.operation == 'success') {

        dispatch(setUnVerifiedToken({
          token: null
        }));
        
        // After successful login
        dispatch(loginWithCredentials(res.token));

        dispatch(setIsProfileCompleted({ 
          isProfileCompleted: res.isProfileCompleted
        }));

        dispatch(setUser({
          user: {
            ...res.user,
            candidate_email: res.email 
          }
        }));

        if (res.isProfileCompleted) {
          router.push('/');
        } else if (query.get('fromProfile')) {
          router.push('/profile');
        } else {
          router.push('/phone-number');
        }

      } else if (res.operation === 'error') {

        alertDialog({
          title: t("Error"),
          description: errorMessage(res.message),
        });

        /*
        todo: have alert
        this.alertCtrl.create({
          message: this.authService.errorMessage(res.message),
          buttons: [this.translateService.transform('Okay')]
        }).then(alert => {
          alert.present();
        });*/
      }
      
    }).finally(() => {
      setLoading(false);
    });

    /**
     * .catch(err => {
      console.log("err:" + err);
      alert("err:" + err);
    }).finally(() => {
      setLoading(false);
    })
     */
  } 

  function onKeyUp(e: any) {
  
    // Get current input value
    const value = e.currentTarget.value;
    
    // If a character was entered
    if (value.length === 1) {
        // Find next input element
        const nextInput = e.currentTarget.parentElement?.nextElementSibling?.querySelector('input');
        
        // Focus next input if it exists
        if (nextInput) {
            nextInput.focus();
        }
    } else if (value.length === 0) {
      // Find previous input element
      const prevInput = e.currentTarget.parentElement?.previousElementSibling?.querySelector('input');
      if (prevInput) {
        prevInput.focus();
      }
    }
  }
  
  return (
    <Suspense fallback={<Loading />}>
      <AuthLayout>  
      { !query.get('fromProfile') && <OnboardProgress arrProgress={[22, 0, 0]}></OnboardProgress> }

      <h5 className="mt-[102px] mb-[8px] text-center text-[40px] font-bold leading-[56px]">
        {t('We’ve sent you a code on your email')}
      </h5>

      <p className="self-stretch text-[#4B4B61] text-center text-base font-normal leading-6 mb-[40px] ">
        {t("Please check your email address and type the code here")}    
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-[560px] m-auto mb-[100px]">

          <div className="flex" dir="ltr">
            <FormField 
                  control={form.control}
                  name="c1"
                  render={({ field }) => (
                      <FormItem className="flex-col ms-[16px] me-[16px]">
                          <FormControl>
                              <Input
                              onKeyUp={(e) => onKeyUp(e)}
                              maxLength={1}
                              className="text-center flex h-[72px] flex-col justify-center items-center gap-2.5 flex-[1_0_0] border border-[color:var(--Neutral-30,#EEEEF0)] [background:var(--Neutral-0,#FFF)] px-6 py-5 rounded-2xl border-solid"
                              {...field}  
                              />
                          </FormControl> 
                      </FormItem>
                  )}
                  />
                      <FormField 
                  control={form.control}
                  name="c2"
                  render={({ field }) => (
                      <FormItem className="flex-col ms-[16px] me-[16px]">
                          <FormControl>
                              <Input
                              onKeyUp={(e) => onKeyUp(e)}
                              maxLength={1}
                              className="text-center flex h-[72px] flex-col justify-center items-center gap-2.5 flex-[1_0_0] border border-[color:var(--Neutral-30,#EEEEF0)] [background:var(--Neutral-0,#FFF)] px-6 py-5 rounded-2xl border-solid"
                              {...field}  
                              />
                          </FormControl> 
                      </FormItem>
                  )}
                  />
                      <FormField 
                  control={form.control}
                  name="c3"
                  render={({ field }) => (
                      <FormItem className="flex-col ms-[16px] me-[16px]">
                          <FormControl>
                              <Input
                              onKeyUp={(e) => onKeyUp(e)}
                              maxLength={1}
                              className="text-center flex h-[72px] flex-col justify-center items-center gap-2.5 flex-[1_0_0] border border-[color:var(--Neutral-30,#EEEEF0)] [background:var(--Neutral-0,#FFF)] px-6 py-5 rounded-2xl border-solid"
                              {...field}  
                              />
                          </FormControl> 
                      </FormItem>
                  )}
                  />
                  <FormField 
                  control={form.control}
                  name="c4"
                  render={({ field }) => (
                      <FormItem className="flex-col ms-[16px] me-[16px]">
                          <FormControl>
                              <Input
                              onKeyUp={(e) => onKeyUp(e)}
                              maxLength={1}
                              className="text-center flex h-[72px] flex-col justify-center items-center gap-2.5 flex-[1_0_0] border border-[color:var(--Neutral-30,#EEEEF0)] [background:var(--Neutral-0,#FFF)] px-6 py-5 rounded-2xl border-solid"
                              {...field}  
                              />
                          </FormControl> 
                      </FormItem>
                  )}
                  />

          </div>

          <p className="text-[color:var(--Neutral-95,#23233D)] text-sm font-normal leading-5">
              {t("Didn’t receive a code?")}  &nbsp;
              <a onClick={() => resendCode()} className="cursor-pointer no-underline text-primary">
                {t("Resend Code")}
              </a>
          </p>

          <SubmitButton disabled={!form.formState.isValid || loading || 
            (form.watch('c1') == '' || form.watch('c2') == '' || form.watch('c3') == '' || form.watch('c4') == '') } loading={loading}></SubmitButton>
          
        </form>
      </Form>

      <OnboardFooter></OnboardFooter>
      </AuthLayout>
    </Suspense>
  );
}
