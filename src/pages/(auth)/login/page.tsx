

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
 
import {
  Form
} from "@/components/ui/form"
import { FormInput } from "@/components/ui/form-input";
import OnboardFooter from "@/components/on-board/layout/footer";
import SubmitButton from "@/components/ui/submit-button";
import { setCredentials, setUnVerifiedToken } from "@/store/slices/authSlice";
import { useAppDispatch } from "@/store/store";
import { basicAuth, startUniverseLogin } from "@/providers/auth.service";
import { Button } from "@/components/ui/button";
import { Suspense, useEffect, useState } from "react";
import { setIsProfileCompleted } from "@/store/slices/userSlice";
import { useIonRouter } from "@ionic/react"; 
import { Link } from "react-router-dom";
import { page, track } from "@/providers/analytics.service";
import { useTranslation } from "react-i18next";
import Loading from "./loading";
import AuthLayout from "../layout"
import { alertDialog } from "@/hooks/use-alert-dialog";
//import { useQuery } from "@/utils/common"

declare let grecaptcha: any;

export default function LoginPage() {

  const router = useIonRouter();

  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  
  const [numberOfLoginAttempts, setNumberOfLoginAttempts] = useState(0);
  
  //const query = useQuery();

  const { t } = useTranslation();

  const formSchema = z.object({
    email: z.string({
      required_error: t('Please enter email address')
    }).email(t('Please enter valid email address'))
    .min(1, t('Please enter email address')),
    password: z.string({
      required_error: t("Please enter password")
    }).min(4, { message: t("Password must be at least 4 characters long") })
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "all",
    defaultValues: {
      email: "",
      password: "",
    },
  })

  useEffect(() => {

    page('Login Page');

    //router.prefetch('/home');
     
    return () => {
        track('page_exit', { page: 'Login Page' });
    }
  }, []);

  function onSubmit(values: z.infer<typeof formSchema>) {

    setLoading(true);

    grecaptcha.ready(() => {
      grecaptcha.execute('6Lei9R4pAAAAAEJYoXxoIvP2Uu0oq8iXkCVfmy6V', {action: 'submit'}).then((token: string) => {

        const params = {
          ...values, 
          token: token
        };

        onValidCaptcha(params);
      });
    });  
  } 

  function onValidCaptcha(values: any) {

    basicAuth(values.email, values.password, values.token).then(res => {
 
      if (res.operation != "success") {

        if (res.errorType == "email-not-verified") {
          dispatch(setUnVerifiedToken({
            token: res.unVerifiedToken
          }));
        
          const url = '/verify-email/' + values.email + '?fromProfile=1';
          router.push(url);
        } else {
          alertDialog({
            title: t('Invalid email or password'),
            description: t('The information entered is incorrect. Please try again.'),
          });
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
  
        //todo: set language based on saved preference?
        //language_pref

        router.push('/home');
      }
    }).catch(err => {
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
            {t("What is your email address?")}
          </h5>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-[560px] m-auto mb-[100px]">
    
            <FormInput
                name="email"
                label="Email Address"
                form={form as any}
                type="email"
                required={true}
              />

              <FormInput
                name="password"
                label="Password"
                form={form as any}
                type="password"
                required={true}
              />
              <Link to="/forgot-password">
                {t("Forgot Password?")}
              </Link>

              <SubmitButton disabled={!form.formState.isValid || loading } loading={loading}></SubmitButton>
              
            </form>
          </Form>

          <div className="max-w-[560px] m-auto mb-[100px]">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px flex-1 bg-border"></span>
              <span className="text-sm text-muted-foreground">{t('or')}</span>
              <span className="h-px flex-1 bg-border"></span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => startUniverseLogin()}
              className="w-full h-[56px] text-base font-semibold leading-6"
            >
              <img src="/assets/images/icon-bawes.svg" alt="" className="w-5 h-5" />
              {t("Continue with Universe")}
            </Button>
          </div>

          <OnboardFooter></OnboardFooter>

      </div>
      </AuthLayout>
    </Suspense>
  );
}
