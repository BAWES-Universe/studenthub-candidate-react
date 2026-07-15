

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
 
import {
  Form
} from "@/components/ui/form"
import { FormInput } from "@/components/ui/form-input";
import OnboardFooter from "@/components/on-board/layout/footer";
import SubmitButton from "@/components/ui/submit-button";
import { loginWithCredentials } from "@/store/slices/authSlice";
import { useAppDispatch } from "@/store/store";
import {  loginTwoStep } from "@/providers/auth.service";
import { Suspense, useEffect, useState } from "react";
import { setIsProfileCompleted } from "@/store/slices/userSlice";
import { useIonRouter } from "@ionic/react"; 
import { Link, useParams } from "react-router-dom";
import { page, track } from "@/providers/analytics.service";
import { useTranslation } from "react-i18next";
import Loading from "./loading";
import AuthLayout from "../layout"
import { alertDialog } from "@/hooks/use-alert-dialog";
import { errorMessage } from "@/utils/common";
//import { useQuery } from "@/utils/common"

declare let grecaptcha: any;

export default function LoginTwoStepPage() {

  const params = useParams() as { token: string };
 
  const token: string = decodeURIComponent(params.token as string); 

  const [numberOfLoginAttempts, setNumberOfLoginAttempts] = useState(0);
  //let numberOfLoginAttempts = 0;

  const router = useIonRouter();

  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);

  //const query = useQuery();

  const { t } = useTranslation();

  const formSchema = z.object({
    token: z.string({
      required_error: t("Please enter the code sent to your email")
    }).min(1, { message: t("Please enter the code sent to your email") }),
    otp: z.string({
      required_error: t("Please enter the code sent to your email")
    }).min(1, { message: t("Please enter the code sent to your email") }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "all",
    defaultValues: {
      token: token,
      otp: "",
    },
  })

  useEffect(() => {

    page('Login Two Step Page');

    //router.prefetch('/home');
     
    return () => {
        track('page_exit', { page: 'Login Two Step Page' });
    }
  }, []);

  function onSubmit(values: z.infer<typeof formSchema>) {

    setLoading(true);

    grecaptcha.ready(() => {
      grecaptcha.execute('6Lei9R4pAAAAAEJYoXxoIvP2Uu0oq8iXkCVfmy6V', {action: 'submit'}).then((token: string) => {

        const params = {
          ...values, 
          grecaptchaToken: token
        };

        onValidCaptcha(params);
      });
    });  
  } 

  function onValidCaptcha(values: any) {

    loginTwoStep(values.grecaptchaToken, values.token, values.otp).then(res => {
 
      if (res.operation == 'success') {
        // After successful login
        dispatch(loginWithCredentials(res.token));

        dispatch(setIsProfileCompleted({ 
          isProfileCompleted: res.isProfileCompleted
        }));
  
        //todo: set language based on saved preference?
        //language_pref

        router.push('/home');
      } else {
        
        alertDialog({
          title: t('Error'),
          description: errorMessage(res.message),
        });
      }
      
    }).catch(async err => {
     // alert("err:" + err);

     if (err.status == 401) {
       setNumberOfLoginAttempts(numberOfLoginAttempts + 1); 

       // Check how many login attempts this user made, offer to reset password
       if (numberOfLoginAttempts > 2) {
          alertDialog({
           title: t('Trouble Logging In?'),
           description: t("If you've forgotten your password, contact us to have it reset."),
         });
       }
       else {
         alertDialog({
           title: t('Invalid email or password'),
           description: t('The information entered is incorrect. Please try again.'),
         });
       }
     } else {
       /**
        * Error not accounted for. Show Message
        */
       alertDialog({
         title: t('Unable to Log In'),
         description: t('There seems to be an issue connecting to Payroll servers. Please contact us if the issue persists.'),
       });
     }
    }).finally(() => {
      setLoading(false);
    });
  } 

  return (
    <Suspense fallback={<Loading />}>
      <AuthLayout>  
      <div className="bg-[#fff]">

          <h5 className="mt-[102px] mb-[40px] text-center text-[40px] font-bold leading-[56px]">
            {t("Enter the OTP sent to your email")}
          </h5>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-[560px] m-auto mb-[100px]">
    
            <FormInput
                name="otp"
                label="OTP"
                form={form as any}
                type="text"
                required={true}
              />
 
              <SubmitButton disabled={!form.formState.isValid || loading } loading={loading}></SubmitButton>
              
            </form>
          </Form>

          <OnboardFooter></OnboardFooter>

      </div>
      </AuthLayout>
    </Suspense>
  );
}
