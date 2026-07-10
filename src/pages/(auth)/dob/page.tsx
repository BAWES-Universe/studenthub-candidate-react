

import { OnboardProgress } from "@/components/on-board/progress";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
 
import {
  Form,
} from "@/components/ui/form";
import { Controller } from "react-hook-form";
import OnboardFooter from "@/components/on-board/layout/footer";
import SubmitButton from "@/components/ui/submit-button";
import { Suspense, useEffect, useState } from "react";
import { setUser } from "@/store/slices/userSlice";
import { errorMessage, useQuery } from "@/utils/common";
import { profile, updateBirthDate } from "@/providers/logged-in/account.service";
import { useAppSelector } from "@/store/store";
import { useAppDispatch } from "@/store/store";
import { IonDatetime, useIonRouter } from "@ionic/react";
import { page, track } from "@/providers/analytics.service";
import { alertDialog } from "@/hooks/use-alert-dialog";
import { useTranslation } from "react-i18next";
import Loading from "./loading";
import AuthLayout from "../layout";


export default function DobPage() {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const { user } = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();
  const router = useIonRouter();
  // 1. Define your form.

  let query = useQuery();
  
  const formSchema = z.object({
    candidate_birth_date: z.date().min(new Date(new Date().setFullYear(new Date().getFullYear() - 25)), {
      message: t("Candidate age should be between 16 to 25."),
    }).max(new Date(new Date().setFullYear(new Date().getFullYear() - 16)), {
      message: t("Candidate age should be between 16 to 25."),
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "all",
    defaultValues: {
      candidate_birth_date: user?.candidate_birth_date? 
        new Date(user?.candidate_birth_date || "") : undefined,
    },
  })

  useEffect(() => {

    page('DOB Page');


    /*if (match && match.params.fromProfile)
      //router.prefetch('/profile');
    else
      //router.prefetch('/gender');*/

    return () => {
        track('page_exit', { page: 'DOB Page' });
    }
  }, []);

  useEffect(() => {
    if (!user) {
   //  form.setValue('phone', user?.candidate_phone || "");
    //} else {

      setLoading(true);

      profile().then(res => {
        dispatch(setUser({ user: res }));
        form.setValue('candidate_birth_date', res.candidate_birth_date || "");
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [user]);

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    
    setLoading(true);

    updateBirthDate(values.candidate_birth_date.toISOString()).then(res => {
      if (res.operation == 'success') {

        if (user) {
          dispatch(setUser({ user: {
            ...user,
            candidate_birth_date: values.candidate_birth_date.toISOString()
          } }));
        }

        if (query.get('fromProfile'))
          router.push('/profile');
        else
          router.push('/gender');
      } else {
        alertDialog({
          title: t("Error"),
          description: errorMessage(res.message),
        });
      }
    }).finally(() => {
      setLoading(false);
    });
  } 

  return (
    <Suspense fallback={<Loading />}>
      <AuthLayout>  
        { !query.get('fromProfile') && <OnboardProgress arrProgress={[55, 0, 0]}></OnboardProgress> }

        <h5 className="mt-[102px] mb-[40px] text-center text-[40px] font-bold leading-[56px]">
            {t("When were you born?")}
        </h5>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-[560px] m-auto mb-[100px]">
            { 
              form.formState.errors.candidate_birth_date && 
                <p className="text-red-500 text-center mt-0">
                  {form.formState.errors.candidate_birth_date.message}
                </p> 
            }

            <Controller
                control={form.control}
                name="candidate_birth_date"
                render={({ field }) => (
                  <IonDatetime
                    name="candidate_birth_date"
                    presentation="date"
                    value={field.value instanceof Date
                      ? field.value.toISOString().split('T')[0]
                      : undefined}
                    onIonChange={(e) => {
                      const raw = e.detail.value as string;
                      if (raw) {
                        field.onChange(new Date(raw));
                      }
                    }}
                    className="m-auto block"
                  />
                )}
              />
            

            <SubmitButton disabled={!form.formState.isValid || loading } loading={loading}></SubmitButton>
            
          </form>
        </Form>

        <OnboardFooter></OnboardFooter>
      </AuthLayout>  
    </Suspense>
  );
}
