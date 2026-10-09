

import { OnboardProgress } from "@/components/on-board/progress";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
 
import OnboardFooter from "@/components/on-board/layout/footer";
import SubmitButton from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Suspense, useEffect, useRef, useState } from "react";
import { checkVideoStatus, deleteResume, deleteVideo, profile, updateResume, updateVideo } from "@/providers/logged-in/account.service";
import { dateTimeFormat, errorMessage, useQuery } from "@/utils/common";
import { useIonRouter } from "@ionic/react"; 
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setUser } from "@/store/slices/userSlice";
import { uploadFileToTempS3, getFileMetadata } from "@/providers/logged-in/aws.service";
import { CANDIDATE_RESUME_ACCEPT, CANDIDATE_VIDEO_ACCEPT, candidateUploadError } from "@/providers/logged-in/temp-upload";
import { page, track } from "@/providers/analytics.service";
import { alertDialog } from "@/hooks/use-alert-dialog";
import { useTranslation } from "react-i18next";
import { candidateVideoProcessed$ } from "@/providers/event.service";
import { applyRemovalResult, applySavedVideo, applyWatchedVideoStatus, sanitizedVideoRemovalError, showsExistingUploadControls } from "./video-recovery";
import { setCanGoForward } from "@/store/slices/appSlice";
import { PlayCircle, SaveIcon, VideoIcon, X } from "lucide-react";
import Spinner from "@/components/common/spinner";
import Loading from "./loading";
import AuthLayout from "../layout";
import { Progress } from "@/components/ui/progress";
  //import { Backdrop } from "@/components/common/backdrop";

const formSchema = z.object({
    video: z.string({
      //  required_error: 'Please record or upload video.'
    }).nullable(),
    resume: z.string({
      //  required_error: 'Please upload front side of your national id.'
    }).nullable()
})


export default function VideoPage() {

  const maxDuration = 30;
  //let recordedChunks: any = [];
//  let mediaRecorder: any; 

  const player = useRef(null);
  const videoInput = useRef(null);

  const [format, setFormat] = useState('mp4');// webm
  const [loading, setLoading] = useState(false);
  const [removingVideo, setRemovingVideo] = useState(false);
  const [removingResume, setRemovingResume] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [uploadType, setUploadType] = useState('resume');
  const [resumeSize, setResumeSize] = useState(0);
  const [resumeUploadedAt, setResumeUploadedAt] = useState<string | null>(null);

  const [progress, setProgress] = useState(0);

  const [recording, setRecording] = useState(false);
  const [shouldStop, setShouldStop] = useState(true);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();
  const [stream, setStream] = useState<any>(null);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [countDown, setCountDown] = useState(0);
  const [timer, setTimer] = useState(0);
  //const [interval, setInterval] = useState();
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [recordedChunks, setRecordedChunks] = useState<any>([]);
  const [playingRecording, setPlayingRecording] = useState(false);
  const [havePermission, setHavePermission] = useState(true);
  const [isSafari, setIsSafari] = useState(false);
 
  const { user } = useAppSelector(state => state.user);
  const userRef = useRef(user);
  userRef.current = user;
  const videoEpoch = useRef(0);
  const videoMutationInFlight = useRef(false);
  const videoBusy = removingVideo || uploadingVideo;
  const dispatch = useAppDispatch();
  const router = useIonRouter(); 
  const query = useQuery();

  const { t } = useTranslation();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "all",
    defaultValues: {
      video: user?.candidate_video,
      resume: user?.candidate_resume, 
    },
  })
 
  useEffect(() => {

    page('Video Page');

    updateResumeMetadata();

    /*if (query.get('fromProfile'))
      //router.prefetch('/profile');
    else
      //router.prefetch('/civil-id');*/

    setIsSafari(/^((?!chrome|android).)*safari/i.test(navigator.userAgent));

    //handle event to mark video processed

    const videoStatusSubscription = candidateVideoProcessed$.subscribe((data : any) => {
      const current = userRef.current;
      if (!current || !data?.watch) {
        return;
      }

      const next = applyWatchedVideoStatus(current, data.status, {
        ...data.watch,
        currentEpoch: videoEpoch.current,
      });
      if (next === current) {
        return;
      }

      form.setValue('video', next.candidate_video || "");
      dispatch(setUser({ user: next }));
    });

    if (navigator.mediaDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        setCameras(devices.filter((d) => d.kind === 'videoinput'));
      });
    }

    // on hardware back, cancel recording

    window.addEventListener('onpopstate', () => {
 
      // stop recording on hardware back clicked

      if (!uploadingVideo && !shouldStop) {
        stopRecording();
        return false;
      }
    });

    return () => {
      videoStatusSubscription.unsubscribe();
      track('page_exit', { page: 'Video Page' });
      //window.removeEventListener('onpopstate');
      
      window.onpopstate = (event) => { 
        dispatch(setCanGoForward({canGoForward: true}));
      }

      //todo: 
      if (!shouldStop) {
        stopRecording();
      }
    }
  }, []);

  useEffect(() => {
    const watchedVideo = user?.candidate_video || null;
    if (!watchedVideo || user?.candidate_video_processed) {
      return;
    }

    const epoch = videoEpoch.current;
    let cancelled = false;
    const alertSubscription = setInterval(() => {
      checkVideoStatus().then(res => {
        if (cancelled) {
          return;
        }

        const current = userRef.current;
        if (!current) {
          return;
        }

        const watch = {
          epoch,
          currentEpoch: videoEpoch.current,
          watchedVideo,
        };
        const next = applyWatchedVideoStatus(current, res, watch);
        if (next === current) {
          return;
        }

        candidateVideoProcessed$.next({ status: res, watch });
        clearInterval(alertSubscription);
      }).catch(() => {});
    }, 3 * 1000);

    return () => {
      cancelled = true;
      clearInterval(alertSubscription);
    }
  }, [user?.candidate_video, user?.candidate_video_processed]);

  useEffect(() => {
    if (!user) {

      setLoading(true);

      profile().then(res => {
        dispatch(setUser({ user: res }));
        form.setValue('video', res.candidate_video || "");
        form.setValue('resume', res.candidate_resume || "");

        if (res.candidate_resume) {
          updateResumeMetadata(); 
        }
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [user]);
  
  function updateResumeMetadata() {

    if (!form.getValues().resume) {
      console.log("No resume");
      return;
    }

    const key = 'candidate-resume/' + form.getValues().resume;

    getFileMetadata(key).then((response) => {
      if (!response || !response.ContentLength) {
        setResumeSize(0);
        return;
      }

      const sizeInKB = (Number(response.ContentLength) / 1024).toFixed(2);
      setResumeSize(Number(sizeInKB));
      if (response.LastModified) {
        setResumeUploadedAt(response.LastModified.toISOString());
      }
    });
  }

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
   
    if (query.get('fromProfile'))
      router.push('/profile');
    else
      router.push('/civil-id');
  } 

  function next() {
    if (query.get('fromProfile'))
      router.push('/profile');
    else
      router.push('/civil-id');
  }

  function onVideoError(){
    form.setValue('video', "");
  }

  function removeVideo(){
    if (videoMutationInFlight.current) {
      return Promise.resolve();
    }

    videoMutationInFlight.current = true;
    const epochAtStart = videoEpoch.current;
    const videoAtStart = userRef.current?.candidate_video ?? null;
    videoEpoch.current = epochAtStart + 1;
    setRemovingVideo(true);

    return deleteVideo().then((res) => {
      const current = userRef.current;
      const removalStillCurrent = videoEpoch.current === epochAtStart + 1;
      const videoStillOriginal = !current?.candidate_video || current.candidate_video === videoAtStart;
      if (!current || !removalStillCurrent || !videoStillOriginal) {
        return;
      }

      const outcome = applyRemovalResult(current, res);
      if (!outcome.cleared) {
        videoEpoch.current = epochAtStart;
        alertDialog({
          title: t("Error"),
          description: sanitizedVideoRemovalError(res?.message, t("Could not remove the video. Please try again.")),
        });
        return;
      }

      form.setValue('video', "");
      dispatch(setUser({ user: outcome.user }));
    }).catch(() => {
      if (videoEpoch.current === epochAtStart + 1) {
        videoEpoch.current = epochAtStart;
      }
      alertDialog({
        title: t("Error"),
        description: t("Could not remove the video. Please try again."),
      });
    }).finally(() => {
      videoMutationInFlight.current = false;
      setRemovingVideo(false);
    });
  }

  function removeIntroButton() {
    return (
      <div className="flex justify-center items-center">
        <Button variant={ "ghost"} disabled={videoBusy} onClick={() => removeVideo()}
          className="text-[color:var(--Neutral-70,#7D7D8D)] text-sm font-medium leading-5 text-center m-auto mt-[12px]">
          <img src="/assets/icons/trash.svg" className="w-[16px]"></img>
          { removingVideo ? t("Removing...") : t("Remove Intro") }
        </Button>
      </div>
    );
  }

  function removeResume(){
    setRemovingResume(true);

    deleteResume().then(() => {
      form.setValue('resume', "");

      setResumeSize(0);   
      setResumeUploadedAt(null);

      dispatch(setUser({ user: {
        ...user,
        candidate_resume: null
      } }));

    }).finally(() => {
      setRemovingResume(false);
    });
  }

  /**
   * cancel file upload
   *
  function cancelUpload() {
    setProgress(0);
    setUploading(false);

    if (currentTarget) {
      currentTarget.abort();
    }
  }*/

  /**
   * toogle recorded video status
   */
  function togglePlayer() {

    if(!player || !player.current) {
      return false;
    }

    const ele = (player.current as HTMLVideoElement);

    if (ele.paused == true) {
      setPlayingRecording(true);
      ele.play();
    } else {
      ele.pause();
      ele.currentTime = 0;
      setPlayingRecording(false);
    }
  }

  function onRecodingPlayerEnded() {
    setPlayingRecording(false);
  }

  /**
   * save recording
   */
  function saveRecording() {

    if(player && player.current) {
      const ele = (player.current as HTMLVideoElement)
      ele.muted = true;
      ele.volume = 0;
      ele.pause();
    }
 
    const file = new File([new Blob(recordedChunks, { type: 'video/' + format })], 
      user?.candidate_id + '.' + format);
 
    return uploadVideoFile(file);
  }

  function validateVideoFile(file: any) {

    return new Promise((resolve, reject) => {
      try {
        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {

          if (video.duration > maxDuration) {
            reject(t('Video duration can not exceed 30 second limit'));
          }

          resolve(true);
        };

        video.onerror = () => {
          reject(t('Invalid video. Please select a video file.'));
        };

        const formatError = candidateUploadError(file, 'video');
        if (formatError) {
          reject(formatError);
          return;
        }

        video.src = window.URL.createObjectURL(file);

      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Upload video from browser
   * @param event
   */
  async function browserVideoUpload(event: any) {

    const fileList: FileList = event.target.files;
 
    if (fileList.length == 0) {
      return false;
    }

    return validateVideoFile(fileList[0]).then(() => {
      return uploadVideoFile(fileList[0]);
    }, err => {

      alertDialog({
        title: t("Error"),
        description: err
      });
    });
  }

  function uploadVideoFile(file: any) {
    if (videoMutationInFlight.current) {
      return Promise.resolve();
    }

    const formatError = candidateUploadError(file, 'video');
    if (formatError) {
      alertDialog({
        title: t("Invalid File Format"),
        description: formatError
      });
      setUploadingVideo(false);
      return Promise.resolve();
    }

    videoMutationInFlight.current = true;
    setUploadingVideo(true);

    return Promise.resolve().then(() => {
      const upload = uploadFileToTempS3(file, 'video');

      upload.on('httpUploadProgress', (progress: any) => {
        console.log(progress);
      });

      return upload.done();
    }).then((res: any) => updateVideo(res.Key)).then((res: any) => {
      const current = userRef.current;
      const saved = current ? applySavedVideo(current, res) : null;

      if (!current || !saved || saved === current) {
        alertDialog({
          title: t("Error"),
          description: errorMessage(res.message),
        });
        return;
      }

      videoEpoch.current += 1;

      form.setValue('video', saved.candidate_video || "");

      setRecordedChunks([]);

      setProgress(0);

      dispatch(setUser({ user: saved }));
    }).catch((error) => {
      console.error('Upload failed:', error);
    }).finally(() => {
      videoMutationInFlight.current = false;
      setUploadingVideo(false);
    });
  }

  /**
   * start camera in mobile app
   */
  function startCamera(immediate = false) {
    setHavePermission(true);

    if (typeof MediaRecorder == 'undefined' || cameras.length == 0) {
      if (videoInput && videoInput.current) {
        const ele = videoInput.current as HTMLInputElement;
        ele.click();
      }
    //} else if (this.platform.is('hybrid')) {
    //  this.startCameraInMobile();
    } else {
      startCameraInBrowser(immediate);
    }
  }

  useEffect(() => {
  
      const blob = new Blob(recordedChunks, { 
        //duration: (maxDuration - timer) + '',
        type: 'video/' + format 
      });
      const url = URL.createObjectURL(blob);

      setVideoBlobUrl(url);

      if(player && player.current) {

        /*const videoElement = document.getElementById('video');
        videoElement.src = url;
        videoElement.play();*/

        const ele = player.current as HTMLVideoElement;
        ele.muted = false;
        ele.volume = 1;
        ele.src = url
        ele.srcObject = null;
        //new Blob(recordedChunks, { type: "video/mp4;codecs=avc1,opus"}));
        ele.pause();
      }

  }, [recordedChunks]);

  useEffect(() => {

    if (!mediaRecorder) {
      return;
    }

    mediaRecorder.addEventListener('dataavailable', (e: any) => {
 
      if (e.data.size > 0) {
       // recordedChunks.push(e.data);
        const newData = [...recordedChunks, e.data];
        
        setRecordedChunks(newData);//(chunks: any) => chunks.push(e.data));
       // setFormat(e.data.type)

        if(player && player.current && recordedChunks.length > 0) {
          const ele = player.current as HTMLVideoElement;
          ele.muted = false;
          ele.volume = 1;
          ele.srcObject = null;
          ele.src = URL.createObjectURL(new Blob(recordedChunks, { type: 'video/' + format }));
          //new Blob(recordedChunks, { type: "video/mp4;codecs=avc1,opus"}));
          //ele.play();
        }
      }
    });

    mediaRecorder.addEventListener('stop', () => {
  
      //this.candidate.tm = URL.createObjectURL(new Blob(recordedChunks));
      // downloadLink.download = 'acetest.webm';

      //const blob = new Blob([recordedChunks], { type: 'video/' . this.format });

      //not triggering 
      /*if(player && player.current && recordedChunks.length > 0) {
        const ele = player.current as HTMLVideoElement;
        ele.muted = false;
        ele.volume = 1;
        ele.srcObject = null;
        ele.src = URL.createObjectURL(new Blob(recordedChunks, { type: 'video/' + format }));
        //new Blob(recordedChunks, { type: "video/mp4;codecs=avc1,opus"}));
        //ele.play();
      }*/

      setRecording(false);

      // no need to cancel recording on hardware back

      // window.history.back();

      //saving recorded video without preview as it's showing blank video 
      //saveRecording();
      
      if (recordedChunks.length == 0) {
        return false;
      } 
    });
  }, [mediaRecorder]);

  useEffect(() => {
    if (player && player.current) {
      let ele = player.current as HTMLVideoElement;

      if (!shouldStop && stream) {
        ele.srcObject = stream;
        ele.muted = true;
        ele.onloadedmetadata = (e) => {
          ele.play().catch(error => {
            console.error('Error playing video:', error);
          });
        };
      }
    }
  }, [shouldStop, player]);//shouldStop

/*  useEffect(() => {
    if(player && player.current) {
      const ele = player.current as HTMLVideoElement;

      if (!recording) {
        ele.muted = false;
        ele.volume = 1;
        ele.srcObject = null;
        ele.src = URL.createObjectURL(new Blob(recordedChunks));
        ele.pause();
      }
    }
  }, [recording]);//shouldStop*/

  /**
   * start recording in mobile browser
   */
  function startCameraInBrowser(immediate = false) {

    setRecordedChunks([]);
    setStream(null);

    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      .then((stream) => {

       // window.history.pushState({ navigationId: window.history.state.navigationId }, null, window.location.pathname);

        setStream(stream);

        setShouldStop(false);

        let options;

        /*if (MediaRecorder.isTypeSupported('video/webm; codecs=vp9')) {
            options = {mimeType: 'video/webm; codecs=vp9'};
            this.format = "webm";
        } else  */
        if (MediaRecorder.isTypeSupported('video/mp4')) {
          options = {mimeType: 'video/mp4', videoBitsPerSecond : 100000};
          setFormat("mp4");
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          options = {mimeType: 'video/webm'};
          setFormat("webm");
        } else {
          throw new Error("no suitable mimetype found for this device");
        }
         
       // setRecordedChunks([]);

        //mediaRecorder = new MediaRecorder(stream, options);
        setMediaRecorder(new MediaRecorder(stream, options));

        // show live feed

       // setTimeout(() => {
          if(player && player.current) {
            const ele = player.current as HTMLVideoElement;
            ele.srcObject = stream;
            ele.muted = true;
            ele.onloadedmetadata = (e) => {
              ele.play();
            };
          }

       // });

        // this.mediaRecorder.start();

        if(immediate) {
          startCountDown();
        }
      })
      .catch(async (err) => {

        /*if(this.format == "webm") {
          this.format = "mp4";
          this.startCameraInBrowser(immediate);
          return;
        }*/

        // in case error from recording

        stopRecording();
 
        setHavePermission(false);

        alertDialog({
          title: t("Error"),
          description:  t('txt_recording_error', {
            error: err.name
          })
        });
      });
  }

  useEffect(() => {
    if (countDown == 0 && recording) {
      startRecording();
      return;
    }

  }, [countDown, recording]);

  useEffect(() => {
   
    /*if (countDown == 0 && recording) {
      startRecording();
      return;
    }*/
 
    setTimeout(() => {
      if (countDown > 0) {
        setCountDown(count => count - 1);
      }
    }, 1000);
  }, [countDown]);

  function startCountDown() {
 
    // window.history.pushState({ navigationId: window.history.state.navigationId }, null, window.location.pathname);
    setCountDown(3);
    setRecording(true);
  }

  async function startRecording() {
 
    //if had error on starting camera

    if (!mediaRecorder) {
 
      //this.fileInput.nativeElement.click();
      stopRecording();

      alertDialog({
        title: t("Error"),
        description: t('Error on starting recording')
      });

      return;
    }

    //if already recording

    if(mediaRecorder.state == 'recording') {
      return false;
    }

    // start timer

    setTimer(maxDuration);
  }

  useEffect(() => {
 
    if (!recording) {
      return;
    }

    // start recorder after count down
    if (timer == maxDuration) {
      mediaRecorder?.start();
    }

    // on timeout stop recording

    if (timer == 0 && recording) {
      stopRecording();
      return;
    }

    setTimeout(() => {
      setTimer(timer => timer - 1);
    }, 1000);
  }, [timer]);

  function cancelRecording() {
    setRecordedChunks([]);

    if(player && player.current) {
      const ele = player.current as HTMLVideoElement;
      ele.muted = true;
      ele.volume = 0;
      ele.src = '';
      ele.srcObject = null;
      ele.pause();
    }

    setRecording(false);
    setShouldStop(true);
  }

  /**
   * stop recording in mobile browser
   */
  function stopRecording() {
     
    //setShouldStop(true);

    /*if (interval) {
      clearInterval(interval);
     // this.interval = null;
    }*/

    if (mediaRecorder && mediaRecorder.state != 'inactive') {
      mediaRecorder.stop();
    } else {
 
      /*setRecordedChunks([]);

      if(player && player.current) {
        const ele = player.current as HTMLVideoElement;
        ele.muted = true;
        ele.volume = 0;
        ele.src = '';
        ele.srcObject = null;
        ele.pause();
      }

      setRecording(false);
      setShouldStop(true);*/
    }

    // stop camera
    if (stream) {
      setStream(null);
      stream.getTracks().forEach((track: any) => {
        track.stop();
      });
    }
  }

  function onRecordingPlayerEnded() {
    setPlayingRecording(false);
  }

  function uploadResume() {
    setUploadType('resume');
    document.getElementById('resumeUpload')?.click();
  }

  function uploadPortfolio() {
    setUploadType('portfolio');
    document.getElementById('resumeUpload')?.click();
  }

  return (
    <Suspense fallback={<Loading />}>
      <AuthLayout>
        { !query.get('fromProfile') && <OnboardProgress arrProgress={[100, 100, 60]}></OnboardProgress> }

        <h5 className="text-[color:var(--Neutral-100,#0F0F2C)] text-center 
         text-[40px] font-bold leading-[56px] mt-[102px] mb-2">
          { t("Tell us about yourself")}
        </h5>
  
        <p className="text-center text-[#4b4b61] text-base font-normal leading-normal mb-10">
          { t("We know it’s hard, but you can do it!") }
        </p>

        { /**block-inline max-w-[313px] xs:max-w-full xs:w-full  */}

       <div suppressHydrationWarning={true} className="flex flex-col md:flex-row max-w-[750px]  min-h-[196px] m-auto mb-[24px]">
            
            { showsExistingUploadControls(form.getValues().video) && <div className="relative xs:max-w-full md:max-w-[375px]  flex-none text-center py-[24px] px-[46px] shrink-0 border-[color:var(--Neutral-30,#EEEEF0)] 
                [background:var(--Neutral-10,#FAFAFA)] rounded-2xl border-[1.333px] border-dashed mb-[24px] md:mb-0 md:me-[24px]">

              { shouldStop && recordedChunks.length == 0 && <>

                <img src="/assets/icons/video.svg" className="m-auto"></img>   

                <h6 className="self-stretch text-[color:var(--Neutral-95,#23233D)] text-center 
                    text-base font-semibold leading-6 mt-[8px] mb-[4px] block">
                    {t("Introductory Video")}
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button className="inline relative top-[7px] m-0 p-[5px]" variant={'ghost'}>
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[100%] p-[24px] max-w-[429px] text-[color:var(--Neutral-95,#23233D)] text-center text-base font-normal leading-6">
                        <p className="mb-[24px]">
                        {t("Introductory video enhances your chance of being selected among other candidates.")}</p>
                      </PopoverContent>

                    </Popover>    
                </h6> 

                <p className={ `self-stretch ${havePermission ? 'text-[#4B4B61]': 'text-red-500'} text-center text-sm font-normal leading-5 mt-[4x] block` }>
                  { havePermission? t("Record a 30-second video introducing yourself."):
                    t("Missing required permission") }
                </p>

                <div className="mt-[16px] block">
                  
                  { videoBusy? <p className="text-[color:var(--Neutral-70,#7D7D8D)] text-sm font-normal leading-5 text-center">{uploadingVideo ? t("Uploading...") : t("Removing...")}</p> :
                  <>

                    <a onClick={() => startCameraInBrowser()} className="cursor-pointer text-[color:var(--Blue-Tint-Main,#4C70F2)]  text-xs font-medium leading-4 ">
                      {t("Record yourself")}
                    </a>

                    <span className="text-xs font-medium">&nbsp;or&nbsp;</span> 

                    <a onClick={() => document.getElementById('videoUpload')?.click()}  className="cursor-pointer text-[color:var(--Blue-Tint-Main,#4C70F2)]  text-xs font-medium leading-4">
                      {t("Upload video")}
                    </a>
                  </>
                  }
                </div>
                </>}

              { (!shouldStop || recordedChunks.length > 0) && <>

                { videoBlobUrl && <video
                  controls={true}
                  ref={player}
                  src={videoBlobUrl}
                  id="player"
                  //volume="0"
                  onEnded={() => onRecordingPlayerEnded()}
                  onClick={() => togglePlayer()}
                  className="h-auto w-full"
                  autoPlay loop muted 
                >
                  <source src={videoBlobUrl} type={ "video/" + format } />
                </video> }

                {/* Play button if video recorded */}
                {!playingRecording && countDown === 0 && recordedChunks.length > 0 && (
                  <Button variant="ghost" className="btn-toggle-video absolute top-10 start-[calc(50%)]" onClick={togglePlayer}>
                    <PlayCircle className="w-8" />
                  </Button>
                )}

                {/* Countdown display */}
                {countDown > 0 && <span className="txt-count-down absolute w-full h-full 
                  bg-[#0f0f2c]/50 justify-center flex items-center top-0 start-0">
                  {/*<Backdrop onClick={() => {}} />*/}
                  <span className="text-white text-8xl">
                  {countDown}
                  </span>
                </span>}

                <div className="btn-wrapper mt-4">
                  
                  {countDown === 0 && !recording && (
                    <>
                        {recordedChunks.length === 0 && (
                            <Button
                              tabIndex={3}
                              className="btn-start-recording me-4 mb-4"
                              onClick={() => startCountDown()}
                            >
                              <VideoIcon /> {t('Start recording')}
                            </Button>
                        )}
 
                        {recordedChunks.length > 0 && (
                          <>
                              <Button
                                tabIndex={4}
                                className="btn-start-recording  me-4 mb-4"
                                onClick={() => saveRecording()}
                                disabled={videoBusy}
                              >
                                { uploadingVideo ? <Spinner />: <><SaveIcon /> {t('Save')}</> }
                              </Button>
                            
                              <Button
                                tabIndex={3}
                                className="btn-restart-recording  me-4 mb-4"
                                onClick={() => startCamera(true)}
                              >
                                <VideoIcon /> {t('Re-take')}
                              </Button>
                          </>
                        )}
                         
                        <Button
                          tabIndex={5}
                          className="btn-cancel-upload  me-4 mb-4"
                          variant="outline"
                          onClick={cancelRecording}
                        >
                          <X /> { t('Cancel')}
                        </Button>
                        
                    </>
                  )}

                  { countDown === 0 && recording && (
                    <Button
                      tabIndex={3}
                      variant={"destructive"}
                      className="btn-stop-recording h-[60px] relative pt-6"
                      onClick={stopRecording}
                    >
                      <b className="top-2 start-[55px] absolute">{t("Stop recording")}</b> <br />
                      <span className="opacity-70">
                        {t("Time elapsed")}: {timer} {t('seconds')}
                      </span>
                    </Button>
                  )}
                </div>
              </>}

            </div> }

            { form.getValues().video && <div className="xs:max-w-full w-full md:max-w-[375px]  flex-none 
                  rounded-2xl mb-[24px] md:mb-0 md:me-[24px]">

                {/*<img src={ import.meta.env.VITE_PERMANENT_BUCKET_URL + 'candidate-video/' +  form.getValues().video + '.jpg' } 
                  onError={() => onVideoError()}
                  className="w-full"></img>   */}

                { !user?.candidate_video_processed && <>
                  <img src="/assets/icons/video.svg" className="m-auto"></img>   

                  <h6 className="self-stretch text-[color:var(--Neutral-95,#23233D)] text-center 
                    text-base font-semibold leading-6 mt-[8px] mb-[4px] block">
                    {t("Making your video ready")}</h6>

                    <p className={ `self-stretch ${havePermission ? 'text-[#4B4B61]': 'text-red-500'} text-center text-sm font-normal leading-5 mt-[4x] block` }>
                      { t("Our server processing your video, It will be ready soon.") }
                    </p>

                    {removeIntroButton()}
                  </>
                }

                { !!user?.candidate_video_processed && <>
                  <video
                    controls={true}
                    preload="none"
                    muted
                    id="saved-player"
                    poster={ user?.candidate_video? 
                      import.meta.env.VITE_PERMANENT_BUCKET_URL + 
                        'candidate-video/' + user.candidate_video + '.jpg': '' }
                    //volume="0"
                    className="h-auto w-full"
                  >
                    { user?.candidate_video && <source src={  import.meta.env.VITE_PERMANENT_BUCKET_URL 
                      + 'candidate-video/' + user.candidate_video + '.mp4' }
                          type="video/mp4" /> }
                  </video>

                  {removeIntroButton()}
                </>}
            </div> }
            
            { uploadingResume && <div className="xs:max-w-full h-auto md:max-w-[375px] flex-none py-[24px] px-[24px] shrink-0
             bg-white rounded-2xl shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)] border border-slate-200">
              <div className="self-stretch flex-col justify-start items-start gap-1 flex">
                  <div className="self-stretch text-[#22223d] text-lg font-semibold leading-7">
                    {t("Upload CV")}</div>
                  <div className="mt-1 self-stretch text-[#4b4b61] text-xs font-normal leading-none">
                    {t("Upload your CV to help our recruiters learn more about you")}</div>
              </div>
              <div className="my-2.5 self-stretch justify-between items-start inline-flex">
                  <div className="text-[#0f0f2c] text-xs font-normal leading-none">
                    {t("Uploading...")}</div>
                  <div className="text-[#0f0f2c] text-xs font-normal leading-none">
                    {progress}%
                  </div>
              </div>
              <Progress value={progress} />
            </div> }

            { uploadingPortfolio && <div className="xs:max-w-full h-auto md:max-w-[375px] flex-none py-[24px] px-[24px] shrink-0
             bg-white rounded-2xl shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)] border border-slate-200">
              <div className="self-stretch flex-col justify-start items-start gap-1 flex">
                  <div className="self-stretch text-[#22223d] text-lg font-semibold leading-7">
                    {t("Upload Portfolio")}
                  </div>
                  <div className="mt-1 self-stretch text-[#4b4b61] text-xs font-normal leading-none">
                    {t("Upload your Portfolio to showcase your work/personal projects")}
                   </div>
              </div>
              <div className="my-2.5 self-stretch justify-between items-start inline-flex">
                  <div className="text-[#0f0f2c] text-xs font-normal leading-none">
                    {t("Uploading...")}</div>
                  <div className="text-[#0f0f2c] text-xs font-normal leading-none">
                    {progress}%
                  </div>
              </div>
              <Progress value={progress} />
            </div> }

            { !form.getValues().resume && !uploadingResume && !uploadingPortfolio && <div className="xs:max-w-full md:max-w-[375px] flex-none text-center py-[24px] px-[24px] shrink-0 border-[color:var(--Neutral-30,#EEEEF0)] 
                [background:var(--Neutral-10,#FAFAFA)] rounded-2xl border-[1.333px] border-dashed">

                <img src="/assets/icons/cv.svg" className="m-auto" />

                <h6 className="self-stretch text-[color:var(--Neutral-95,#23233D)] text-center 
                    text-base font-semibold leading-6  mt-[8px] mb-[4px] block">
                    {t("CV or Portfolio")}
                </h6> 

                <p className="self-stretch text-[#4B4B61] text-center text-sm font-normal leading-5 mt-[4x] block">
                  {t("Have a cool file to showcase your skills and experiences?")}
                </p>

                <div className="mt-4 h-10 justify-start items-start gap-2.5 inline-flex">
                  <button onClick={() => uploadResume()} className="px-4 py-2 bg-white rounded-md border border-slate-200 justify-center items-center gap-2.5 inline-flex text-slate-900 text-sm font-medium leading-normal">
                    { t("Upload CV") }
                  </button>
                  <button onClick={() => uploadPortfolio()} className="px-4 py-2 bg-white rounded-md border border-slate-200 justify-center items-center gap-2.5 inline-flex text-slate-900 text-sm font-medium leading-normal">
                    { t("Upload Portfolio") }
                  </button>
                </div>

{/*
                <a onClick={() => document.getElementById('resumeUpload')?.click()} className="cursor-pointer text-[color:var(--Blue-Tint-Main,#4C70F2)] text-center text-xs font-medium leading-4 mt-[16px] block">
                { uploadingResume ? t("Uploading...") : t("Upload CV or Portfolio") }   
                </a>
  */}
            </div> }

            { form.getValues().resume && !uploadingResume && !uploadingPortfolio && <div className="xs:max-w-full md:max-w-[390px] w-full flex-none 
                  rounded-2xl mb-[24px] md:mb-0 justify-center items-center">
  
                <div className="h-[106px] justify-start items-start gap-2.5 inline-flex">

                  <embed className="w-[122.50px] h-[106px] rounded-2xl border border-[#eeeef0]" src={ import.meta.env.VITE_PERMANENT_BUCKET_URL + 'candidate-resume/' + form.getValues().resume} type="application/pdf" 
                  ></embed>
                   
                  <div className="grow shrink basis-0 flex-col justify-start items-start gap-[17px] inline-flex">
                      <div className="self-stretch h-12 flex-col justify-start items-start gap-1 flex">
                          <div className="w-56 text-[#22223d] text-base font-semibold leading-normal capitalize">
                          { form.getValues().resume }
                          </div>

                          { resumeSize > 0 && <div className="w-56 text-[#4b4b61] text-sm font-normal leading-tight">
                            { resumeSize } KB { resumeUploadedAt && '| ' + t('Uploaded') + ' ' + dateTimeFormat(resumeUploadedAt, 'MMM d, yyyy')  } 
                          </div>
                          }
                         
                      </div>
                      <div className="self-stretch justify-start items-start gap-2.5 inline-flex mt-4">
                          <a href={ import.meta.env.VITE_PERMANENT_BUCKET_URL + 'candidate-resume/' + form.getValues().resume} target="_blank" className="px-4 py-2 bg-white rounded-md border border-slate-200 justify-center items-center gap-2.5 flex">
                              <div className="text-slate-900 text-sm font-medium leading-normal">
                                {t("Download")}
                              </div>
                          </a>
                          <button onClick={() => uploadResume()} className="grow shrink basis-0 h-10 px-4 py-2 bg-white rounded-md border border-slate-200 justify-center items-center gap-2.5 flex">
                              <div className="text-slate-900 text-sm font-medium leading-normal">
                                {t("Update Portfolio")}
                              </div>
                          </button>
                      </div>
                  </div>
                </div>
                
                <div className="flex justify-center items-center">
                  <Button variant={ "ghost"} onClick={() => removeResume()} 
                    className="text-[color:var(--Neutral-70,#7D7D8D)] text-sm font-medium leading-5 text-center m-auto mt-[12px]">
                      <img src="/assets/icons/trash.svg" className="w-[16px]"></img>   
                      { removingResume ? t("Removing...") : t("Remove CV") } 
                  </Button>
                </div>
            </div> }

        </div>  
    
        <input
          type="file"
          id="resumeUpload"
          className="hidden"
          accept={CANDIDATE_RESUME_ACCEPT}
          onChange={(e) => {
              const file = e.target.files?.[0];

              if (file) {
                  const formatError = candidateUploadError(file, 'resume');
                  if (formatError) {
                    alertDialog({
                      title: t("Invalid File Format"),
                      description: formatError
                    });
                    e.target.value = '';
                    return;
                  }

                  if (uploadType == 'portfolio') {
                    setUploadingPortfolio(true);
                  } else {
                    setUploadingResume(true);
                  }

                  setProgress(0);

                  const upload = uploadFileToTempS3(file, 'resume');
                  
                  console.log(upload);

                  upload.on('httpUploadProgress', (progress: any) => {
                    console.log(progress);
                    setProgress(progress.loaded / progress.total * 100);
                  });

                  upload.done().then((res: any) => {
                    
                    updateResume(res.Key).then((res: any) => { 
                     
                      if (res.operation == 'success') {   

                        form.setValue('resume', res.candidate_resume);
                        
                        updateResumeMetadata(); 

                        dispatch(setUser({ user: {
                          ...user,
                          candidate_resume: res.candidate_resume
                        } }));
                      } else {
                          alertDialog({
                            title: t("Error"),
                            description: errorMessage(res.message),
                          });
                      }
                    }).finally(() => {
                      setUploadingResume(false);
                      setUploadingPortfolio(false);
                    });
                  }).catch((error) => {
                    // Handle upload error
                    console.error('Upload failed:', error);
                    setUploadingResume(false);
                    setUploadingPortfolio(false);
                  })
              }
          }}
      />

        <input
          type="file"
          id="videoUpload"
          className="hidden"
          disabled={videoBusy}
          ref={videoInput}
          accept={CANDIDATE_VIDEO_ACCEPT}
          onChange={(e) => {
            browserVideoUpload(e);
          }}
      />

        {/*<Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-[16px] max-w-[650px] m-auto mb-[100px]">
          *!form.formState.isValid ||  */}
            <SubmitButton onClick={() => next() } disabled={loading || uploadingVideo || uploadingResume} 
              loading={loading || uploadingVideo || uploadingResume }></SubmitButton>
            
          {/*</form>
        </Form>*/}

        <OnboardFooter></OnboardFooter>
      </AuthLayout>
    </Suspense>
  );
}
