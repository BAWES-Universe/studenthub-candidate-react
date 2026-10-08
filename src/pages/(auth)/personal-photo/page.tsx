

import { OnboardProgress } from "@/components/on-board/progress";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
 
import {
  Form
} from "@/components/ui/form"
import OnboardFooter from "@/components/on-board/layout/footer";
import SubmitButton from "@/components/ui/submit-button";
import { Suspense, useEffect, useState } from "react";
import { profile, updateProfilePhoto } from "@/providers/logged-in/account.service";
import { errorMessage, useQuery } from "@/utils/common";
import { useIonRouter } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setUser } from "@/store/slices/userSlice";
import { uploadFileToTempS3 } from "@/providers/logged-in/aws.service";
import { CANDIDATE_IMAGE_ACCEPT, candidateUploadError } from "@/providers/logged-in/temp-upload";
import { personalPhotoSrc, retainPhotoKeyAfterLoadError } from "@/providers/logged-in/profile-photo-display";
import { page, track } from "@/providers/analytics.service";
import { alertDialog } from "@/hooks/use-alert-dialog";
import { useTranslation } from "react-i18next";
import Loading from "./loading";
import AuthLayout from "../layout";


// Define the User type
interface User {
  candidate_personal_photo?: string;
  candidate_personal_photo_url?: string | null;
}

export default function PersonalPhotoPage() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoPreviewFailed, setPhotoPreviewFailed] = useState(false);

  const { user } = useAppSelector(state => state.user as { user: User });

  const dispatch = useAppDispatch();
  const router = useIonRouter();
  const query = useQuery();

  const { t } = useTranslation();

  // 1. Define your form.
  const formSchema = z.object({
    candidate_personal_photo: z.string({
        required_error: t("Please upload photo.")
    }).min(1, t('Please upload photo.')),
    candidate_personal_photo_url: z.string(),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "all",
    defaultValues: {
        candidate_personal_photo: user?.candidate_personal_photo || "",
        candidate_personal_photo_url: user?.candidate_personal_photo_url || "",
    },
  })

  useEffect(() => {

    page('Personal Photo Page');

    /*if (query.get('fromProfile'))
      //router.prefetch('/profile');
    else
      //router.prefetch('/about-yourself');*/

    return () => {
        track('page_exit', { page: 'Personal Photo Page' });
    }
  }, []);

  useEffect(() => {
    if (!user) {

      setLoading(true);

      profile().then(res => {
        dispatch(setUser({ user: res }));
        
        form.setValue('candidate_personal_photo', res.candidate_personal_photo || "");
        form.setValue('candidate_personal_photo_url', res.candidate_personal_photo_url || "");
        setPhotoPreviewFailed(false);

      }).finally(() => {
        setLoading(false);
      });
    }
  }, [user]);
  
  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    
    const isSamePhoto = form.getValues().candidate_personal_photo == user.candidate_personal_photo;

    if (isSamePhoto) {
      if (query.get('fromProfile'))
        router.push('/profile');
      else
        router.push('/about-yourself');

      setLoading(false);
      return;
    }

    updateProfilePhoto(values.candidate_personal_photo).then(res => {
      if (res.operation == 'success') {

        if (user) {
          
          //user.candidate_personal_photo = res.candidate_personal_photo;

          dispatch(setUser({ user: {
            ...user,
            candidate_personal_photo: res.candidate_personal_photo,
            candidate_personal_photo_url: res.candidate_personal_photo_url
          } }));
        }

        if (query.get('fromProfile'))
          router.push('/profile');
        else
          router.push('/about-yourself');
      } else {
        alertDialog({
          title: t("Error"),
          description: errorMessage(res.message),
        });
      }
    }).catch((err) => {
      alertDialog({ title: t("Error"), description: t("Failed to update photo.") });
    }).finally(() => {
      setLoading(false);
    });
  } 

  function onPhotoLoadError() {
    const retained = retainPhotoKeyAfterLoadError({
      candidate_personal_photo: form.getValues().candidate_personal_photo,
      candidate_personal_photo_url: form.getValues().candidate_personal_photo_url,
    });
    form.setValue('candidate_personal_photo', retained.candidate_personal_photo || "");
    setPhotoPreviewFailed(true);
  }
  
  return (
    <Suspense fallback={<Loading />}>
      <AuthLayout>  
        { !query.get('fromProfile') && <OnboardProgress arrProgress={[100, 100, 24]}></OnboardProgress> }

        <h5 className="mt-[102px] mb-[8px] text-center text-[40px] font-bold leading-[56px]">
          {t("Show us what you look like")}
        </h5>
        <p className="mb-[40px] self-stretch text-[#4B4B61] text-center text-base font-normal leading-6">
          {t("Please make sure that your picture is professional, shows your face and is not blurry")}
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-[560px] m-auto mb-[100px]">
  
          { form.getValues().candidate_personal_photo && 
            <div className="w-40 h-40 m-auto border-[color:var(--Neutral-30,#EEEEF0)] 
                [background:var(--Neutral-10,#FAFAFA)] rounded-[80px] border-[1.333px] border-dashed overflow-hidden">
                
                <img onError={() => onPhotoLoadError()} src={photoPreviewFailed
                  ? personalPhotoSrc(null)
                  : personalPhotoSrc({
                    candidate_personal_photo: form.getValues().candidate_personal_photo,
                    candidate_personal_photo_url: form.getValues().candidate_personal_photo_url,
                  })}
                  className="w-40 h-40"></img>   

            </div> }

          { !form.getValues().candidate_personal_photo && 
            <div className="w-40 h-40 m-auto border-[color:var(--Neutral-30,#EEEEF0)] 
                [background:var(--Neutral-10,#FAFAFA)] rounded-[80px] border-[1.333px] border-dashed">
                <img src="/assets/icons/camera.svg" className="w-10 h-10 m-auto mt-[48px]" />
                <a onClick={() => document.getElementById('photoUpload')?.click()} 
                className="text-[color:var(--Blue-Tint-Main,#4C70F2)] text-center 
                 text-xs font-medium leading-4 block cursor-pointer">
                   { uploading ? t("Uploading...") : t("Upload picture") }    
                </a>
            </div> }
            
            { form.getValues().candidate_personal_photo && 
                <a onClick={() => document.getElementById('photoUpload')?.click()} className="text-[color:var(--Blue-Tint-Main,#4C70F2)] text-center 
                  m-auto block text-xs font-medium leading-4 mt-[8px] cursor-pointer">
                    { uploading ? t("Uploading...") : t("Upload picture") }    
                </a> }
 
                <input
                    type="file"
                    id="photoUpload"
                    className="hidden"
                    accept={CANDIDATE_IMAGE_ACCEPT}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      // File validations
                      const isDNG = file.name.toLowerCase().endsWith('.dng') || file.type === 'image/x-adobe-dng';
                      const isTooLarge = file.size > 10 * 1024 * 1024; // 10MB
                      if(isDNG){
                        alertDialog({
                          title: t("Invalid File Format"),
                          description: t("DNG format is not supported. Please upload a different image format.")
                        });
                        e.target.value = '';
                        return;
                      }
                      if(isTooLarge){
                        alertDialog({
                          title: t("File Too Large"),
                          description: t("The selected file is too large. Maximum allowed size is 10MB.")
                        });
                        e.target.value = '';
                        return;
                      }
                      const formatError = candidateUploadError(file, 'profile_photo');
                      if (formatError) {
                        alertDialog({
                          title: t("Invalid File Format"),
                          description: formatError
                        });
                        e.target.value = '';
                        return;
                      }
                      setUploading(true);

                      const upload = uploadFileToTempS3(file, 'profile_photo');

                      upload.on('httpUploadProgress', (progress: any) => {
                        console.log(progress);
                      });

                      upload.done().then((response: any) => {

                        form.setValue('candidate_personal_photo', response.Key);
                        form.trigger('candidate_personal_photo');
                        form.setValue('candidate_personal_photo_url', response.Location);
                        form.trigger('candidate_personal_photo_url');
                        setPhotoPreviewFailed(false);

                      }).catch((error) => {
                        // Handle upload error
                        console.error('Upload failed:', error);
                      }).finally(() => {
                        setUploading(false);
                      });
                    }}
                />

            <SubmitButton disabled={ !form.getValues().candidate_personal_photo || loading || uploading } float={ false } 
              loading={loading}></SubmitButton>
            
          </form>
        </Form>

        <OnboardFooter></OnboardFooter>
      </AuthLayout>
    </Suspense>
  );
}
