

import { OnboardProgress } from "@/components/on-board/progress";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
 
import {
  Form
} from "@/components/ui/form"
import { FormInput } from "@/components/ui/form-input";
import OnboardFooter from "@/components/on-board/layout/footer";
import SubmitButton from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";

import { Suspense, useEffect, useState } from "react";
import { profile, removeCivilPhotoBack, removeCivilPhotoFront, updateCivilIdAndExpiryDate, updateCivilPhotoBack, updateCivilPhotoFront } from "@/providers/logged-in/account.service";
import { errorMessage, useQuery } from "@/utils/common";
import { useIonRouter } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setUser } from "@/store/slices/userSlice";
import { setAWSConfig, uploadFileToTempS3 } from "@/providers/logged-in/aws.service";
import { page, track } from "@/providers/analytics.service";
import { alertDialog } from "@/hooks/use-alert-dialog";
import { useTranslation } from "react-i18next";
import Loading from "./loading";
import AuthLayout from "../layout";
import { FormDateTimeInput } from "@/components/ui/form-datetime";

 
export default function CivilIdPage() {
  const [loading, setLoading] = useState(false);
  const [removingFrontId, setRemovingFrontId] = useState(false);
  const [removingBackId, setRemovingBackId] = useState(false);
  const [uploadingFrontId, setUploadingFrontId] = useState(false);
  const [uploadingBackId, setUploadingBackId] = useState(false);

  const { user } = useAppSelector(state => state.user);

  const dispatch = useAppDispatch();
  const router = useIonRouter();
 
  const { t} = useTranslation();

  let query = useQuery();
  
  useEffect(() => {

    page('Civil ID Page');

    setAWSConfig();
    
    /*if (match && match.params.fromProfile)
      //router.prefetch('/profile');
    else
      //router.prefetch('/preferred-time');*/

    return () => {
      track('page_exit', { page: 'Civil ID Page' });
    }
  }, []);

  const maxCivilIdExpiryDate = new Date(new Date().setFullYear(new Date().getFullYear() + 10));
  const formSchema = z.object({
    candidate_civil_photo_back_url: z.string().nullable(),
    candidate_civil_photo_front_url: z.string().nullable(),
    candidate_civil_photo_back: z.string({
          required_error: 'Please upload back side of your national id.'
      }).min(1, t('Please upload back side of your national id.')),
    candidate_civil_photo_front: z.string({
          required_error: 'Please upload front side of your national id.'
      }).min(1, t('Please upload front side of your national id.')),
    candidate_civil_expiry_date: z.date({
      }).min(new Date(), {
        message: t("Expired ID not allowed."),
      }).max(maxCivilIdExpiryDate, {
        message: t("ID cannot be more than 10 years from now."),
      }),
    candidate_civil_id: z.string({
        required_error: 'Please add id number.'
    }).min(1, t('Please add id number.'))
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "all",
    defaultValues: {
        candidate_civil_id: user?.candidate_civil_id || "",
        candidate_civil_expiry_date: user?.candidate_civil_expiry_date && user?.candidate_civil_expiry_date?.length > 0? 
          new Date(user?.candidate_civil_expiry_date) : undefined,
        candidate_civil_photo_back: user?.candidate_civil_photo_back,
        candidate_civil_photo_front: user?.candidate_civil_photo_front,
        candidate_civil_photo_back_url: user?.candidate_civil_photo_back?
           import.meta.env.VITE_PERMANENT_BUCKET_URL  + 'photos/' + user?.candidate_civil_photo_back: undefined,
        candidate_civil_photo_front_url: user?.candidate_civil_photo_front?
          import.meta.env.VITE_PERMANENT_BUCKET_URL  + 'photos/' + user?.candidate_civil_photo_front: undefined,
    },
  });

  useEffect(() => {
    if (!user) {
   //  form.setValue('phone', user?.candidate_phone || "");
    //} else {

      setLoading(true);

      profile().then(res => {
        dispatch(setUser({ user: res }));

        if (res.candidate_civil_id) {
          form.setValue('candidate_civil_id', res.candidate_civil_id || "");
          form.trigger('candidate_civil_id');
        }

        if (res.candidate_civil_expiry_date) {
          form.setValue('candidate_civil_expiry_date', new Date(res.candidate_civil_expiry_date));
          form.trigger('candidate_civil_expiry_date');
        }

        form.setValue('candidate_civil_photo_back', res.candidate_civil_photo_back);
        form.trigger('candidate_civil_photo_back');

        form.setValue('candidate_civil_photo_front', res.candidate_civil_photo_front);
        form.trigger('candidate_civil_photo_front');

        if (res.candidate_civil_photo_back) {
          form.setValue('candidate_civil_photo_back_url', import.meta.env.VITE_PERMANENT_BUCKET_URL  + 'photos/' + res.candidate_civil_photo_back);
          form.trigger('candidate_civil_photo_back_url');
        }

        if (res.candidate_civil_photo_front) {
          form.setValue('candidate_civil_photo_front_url', import.meta.env.VITE_PERMANENT_BUCKET_URL  + 'photos/' + res.candidate_civil_photo_front);
          form.trigger('candidate_civil_photo_front_url');
        }

        
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [user]);

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    
    setLoading(true);

    const date = values.candidate_civil_expiry_date.toISOString();

    updateCivilIdAndExpiryDate(values.candidate_civil_id, date).then((res: any) => {
      if (res.operation == 'success') {

        if (user) {
          
          dispatch(setUser({ user: {
            ...user,
            candidate_civil_id: values.candidate_civil_id,
            candidate_civil_expiry_date: date
          } }));
        }

        if (query.get('fromProfile')) {
          router.push('/profile');
        } else {
          router.push('/preferred-time');
        }

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

  function resetFrontId() {

    setRemovingFrontId(true);

    removeCivilPhotoFront().then((res: any) => {
      if (res?.operation && res.operation !== 'success') {
        alertDialog({
          title: t("Error"),
          description: errorMessage(res.message),
        });
        return;
      }

      form.setValue('candidate_civil_photo_front', '');
      form.trigger('candidate_civil_photo_front');
      form.setValue('candidate_civil_photo_front_url', '');
      form.trigger('candidate_civil_photo_front_url');

      dispatch(setUser({ user: {
        ...user,
        candidate_civil_photo_front: null
      } }));

    }).catch(() => {
      alertDialog({
        title: t("Error"),
        description: errorMessage(t("Civil ID photo could not be removed. Please try again.")),
      });
    }).finally(() => {
      setRemovingFrontId(false);
    });
  }

  function resetBackId() {

    setRemovingBackId(true);

    removeCivilPhotoBack().then((res: any) => {
      if (res?.operation && res.operation !== 'success') {
        alertDialog({
          title: t("Error"),
          description: errorMessage(res.message),
        });
        return;
      }

      form.setValue('candidate_civil_photo_back', '');
      form.trigger('candidate_civil_photo_back');
      form.setValue('candidate_civil_photo_back_url', '');
      form.trigger('candidate_civil_photo_back_url');

      dispatch(setUser({ user: {
        ...user,
        candidate_civil_photo_back: null
      } }));

    }).catch(() => {
      alertDialog({
        title: t("Error"),
        description: errorMessage(t("Civil ID photo could not be removed. Please try again.")),
      });
    }).finally(() => {
      setRemovingBackId(false);
    });
  }

  function onCivilIdUploaded(res: any) {

    console.log('onCivilIdUploaded', res); 

   // if (res.candidate_civil_id && res.candidate_civil_expiry_date) {

      if (res.candidate_civil_photo_back) {

        form.setValue('candidate_civil_photo_back_url', 
          import.meta.env.VITE_PERMANENT_BUCKET_URL  + 'photos/' + res.candidate_civil_photo_back);
        form.setValue('candidate_civil_photo_back', res.candidate_civil_photo_back);
        form.trigger('candidate_civil_photo_back_url');
        form.trigger('candidate_civil_photo_back');
      }

      if (res.candidate_civil_photo_front) {  
        form.setValue('candidate_civil_photo_front_url', 
          import.meta.env.VITE_PERMANENT_BUCKET_URL  + 'photos/' + res.candidate_civil_photo_front);
        form.setValue('candidate_civil_photo_front', res.candidate_civil_photo_front);
        form.trigger('candidate_civil_photo_front_url');
        form.trigger('candidate_civil_photo_front');
      }

      if (res.candidate_civil_id) {
        form.setValue('candidate_civil_id', res.candidate_civil_id);
        form.trigger('candidate_civil_id');
      }

      if (res.candidate_civil_expiry_date) {
        form.setValue('candidate_civil_expiry_date', new Date(res.candidate_civil_expiry_date));
        form.trigger('candidate_civil_expiry_date');
      }
      
      dispatch(setUser({ user: {
        ...user,
        candidate_civil_id: res.candidate_civil_id,
        candidate_civil_expiry_date: res.candidate_civil_expiry_date,
        candidate_civil_photo_back: res.candidate_civil_photo_back,
        candidate_civil_photo_front: res.candidate_civil_photo_front
      } }));
  
    //if got both values 
    /*
    if (match && match.params.fromProfile)
      router.push('/profile');
    else
      router.push('/preferred-time');*/
    //}
  }

  return (
    <Suspense fallback={<Loading />}>
      <AuthLayout>
        { !query.get('fromProfile') && <OnboardProgress arrProgress={[100, 100, 72]}></OnboardProgress> }

        <h5 className="text-[color:var(--Neutral-100,#0F0F2C)] text-center 
         text-[40px] font-bold leading-[56px] mt-[102px] mb-[38px]">
            {t('Civil ID Information')}
        </h5>
        { query.get('fromProfile') && (
          <div className="max-w-[650px] m-auto mb-[24px]">
            <Button variant="ghost" type="button" onClick={() => router.push('/profile')}>
              {t('Back to Profile')}
            </Button>
          </div>
        ) }
  { /**block-inline max-w-[313px] xs:max-w-full xs:w-full  */}

       <div suppressHydrationWarning={true} className="flex flex-col sm:flex-row max-w-[640px]  min-h-[196px] m-auto mb-[24px]">
            { !form.getValues().candidate_civil_photo_front && 
            <div className="xs:max-w-full sm:max-w-[313px]  flex-none text-center py-[24px] px-[46px] shrink-0 border-[color:var(--Neutral-30,#EEEEF0)] 
                [background:var(--Neutral-10,#FAFAFA)] rounded-2xl border-[1.333px] border-dashed mb-[24px] sm:mb-0 sm:me-[24px]">

                <img src="/assets/icons/id-front.svg" className="m-auto"></img>   

                <h6 className="self-stretch text-[color:var(--Neutral-95,#23233D)] text-center 
                    text-base font-semibold leading-6 mt-[8px] mb-[4px] block">
                      {t('ID Photo (Front)')}
                </h6> 

                <p className="self-stretch text-[#4B4B61] text-center text-sm font-normal leading-5 mt-[4x] block">
                    {t('Make sure the image is bright and not blurry')}
                </p>

                <input
                    type="file"
                    id="frontIdUpload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (file) {
                            setUploadingFrontId(true);

                            const upload = uploadFileToTempS3(file);

                            upload.on('httpUploadProgress', (progress: any) => {
                              console.log(progress);
                            });

                            upload.done().then((response: any) => {
                             
                                updateCivilPhotoFront(response.Key).then((res: any) => {
                                   
                                  if (res.operation == 'success') {   

                                    onCivilIdUploaded(res);

                                  } else {
                                    alertDialog({
                                      title: t("Error"),
                                      description: errorMessage(res.message),
                                    });
                                  }

                                }).finally(() => {
                                  setUploadingFrontId(false);
                                }); 
                            }).catch((error) => {
                                // Handle upload error
                                console.error('Upload failed:', error);

                                setUploadingFrontId(false);
                            }).finally(() => {
                              
                            });
                        }
                    }}
                />

                <a onClick={() => document.getElementById('frontIdUpload')?.click()} 
                  className="text-[color:var(--Blue-Tint-Main,#4C70F2)]  text-xs font-medium leading-4 mt-[16px] block cursor-pointer">
                    { uploadingFrontId ? t("Uploading...") : t("Upload ID Front") }
                </a>
            </div> }

            { form.getValues().candidate_civil_photo_front && <div className="xs:max-w-full w-full sm:max-w-[313px]  flex-none 
                  rounded-2xl mb-[24px] sm:mb-0 sm:me-[24px]">

                <img onError={() => resetFrontId()} src={form.getValues().candidate_civil_photo_front_url || ""} className="w-full"></img>   

                <Button variant={"ghost"} disabled={removingFrontId} onClick={resetFrontId} className="text-[color:var(--Neutral-70,#7D7D8D)] text-sm font-medium leading-5 text-center m-auto mt-[12px]">
                    <img src="/assets/icons/trash.svg" className="w-[16px]"></img>  
                    { removingFrontId ? t("Removing...") : t("Remove") }
                </Button>
            </div> }
            
            { !form.getValues().candidate_civil_photo_back && <div className="xs:max-w-full sm:max-w-[313px] flex-none text-center py-[24px] px-[46px] shrink-0 border-[color:var(--Neutral-30,#EEEEF0)] 
                [background:var(--Neutral-10,#FAFAFA)] rounded-2xl border-[1.333px] border-dashed">

                <img src="/assets/icons/id-back.svg" className="m-auto"></img>   

                <h6 className="self-stretch text-[color:var(--Neutral-95,#23233D)] text-center 
                    text-base font-semibold leading-6  mt-[8px] mb-[4px] block">
                    {t("ID Photo (Back)")}
                    </h6> 

                <p className="self-stretch text-[#4B4B61] text-center text-sm font-normal leading-5 mt-[4x] block">
                    {t("Make sure the image is bright and not blurry")}
                </p>
                <input
                    type="file"
                    id="backIdUpload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            setUploadingBackId(true);

                            const upload = uploadFileToTempS3(file);  

                            upload.on('httpUploadProgress', (progress: any) => {
                              console.log(progress);
                            });

                            upload.done().then((response: any) => {
                               
                                // Handle successful upload

                                updateCivilPhotoBack(response.Key).then((res: any) => {
                                   
                                  if (res.operation == 'success') {   

                                    onCivilIdUploaded(res);

                                  } else {
                                    alertDialog({
                                      title: t("Error"),
                                      description: errorMessage(res.message),
                                    });
                                  }

                                }).finally(() => {
                                  setUploadingBackId(false);
                                }); 
                            }).catch((error) => {
                                // Handle upload error
                                console.error('Upload failed:', error);
                                setUploadingBackId(false);
                            }).finally(() => {
                              
                            });
                        }
                    }}
                />
                <a onClick={() => document.getElementById('backIdUpload')?.click()} className="text-[color:var(--Blue-Tint-Main,#4C70F2)] text-center text-xs font-medium leading-4 mt-[16px] block cursor-pointer">
                    { uploadingBackId ? t("Uploading...") : t("Upload ID Back") }
                </a>
            </div> }


            { form.getValues().candidate_civil_photo_back && <div className="xs:max-w-full sm:max-w-[313px] w-full flex-none 
                  rounded-2xl mb-[24px] sm:mb-0">

                <img onError={() => resetBackId()} src={form.getValues().candidate_civil_photo_back_url || ""} className="w-full"></img>   

                <Button variant={ "ghost"} disabled={removingBackId} onClick={resetBackId} className="text-[color:var(--Neutral-70,#7D7D8D)] text-sm font-medium leading-5 text-center m-auto mt-[12px]">
                    <img src="/assets/icons/trash.svg" className="w-[16px]"></img>    
                    { removingBackId ? t("Removing...") : t("Remove") }
                </Button>
            </div> }
            
        </div> 
    
        <Form   {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-[16px] max-w-[650px] m-auto mb-[100px]">
  
          <p className="self-stretch text-[color:var(--Neutral-95,#23233D)] text-lg font-semibold leading-7">
            {t("ID Details")}
          </p>

          <FormInput
              name="candidate_civil_id"
              label="ID Number"
              form={form as any}
              type="text"
              required={true}
            />
{ /* todo: have date field

            {  
              form.formState.errors.candidate_civil_expiry_date && 
                <p className="text-red-500 text-center mt-0">
                  {form.formState.errors.candidate_civil_expiry_date.message}
                </p> 
            }

            <IonDatetime name='candidate_civil_expiry_date'
                presentation="date"
                value={form.getValues('candidate_civil_expiry_date')?.toISOString()}
                onIonChange={(e) => {
                  const date = new Date(e.detail.value as string || "");
                  if (date)
                    form.setValue('candidate_civil_expiry_date', date);
                    form.trigger('candidate_civil_expiry_date');
                }}
                className="m-auto block"
            ></IonDatetime>*/ }
             
           <FormDateTimeInput
            required={true}
              name="candidate_civil_expiry_date"
              label="Expiry Date"
              form={form as any}
              maxDate={maxCivilIdExpiryDate}
            />
 
            <SubmitButton disabled={!form.formState.isValid || loading } 
              loading={loading}></SubmitButton>
            
          </form>
        </Form>

        <OnboardFooter ></OnboardFooter>
        </AuthLayout>
    </Suspense>
  );
}
