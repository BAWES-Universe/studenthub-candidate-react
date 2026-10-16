
import { Assignment } from '@/components/app/profile/assignment';
import { CertificateComponent } from '@/components/app/profile/certificate';
import { Education } from '@/components/app/profile/education';
import { Experience } from '@/components/app/profile/experience';
import { Name } from '@/components/app/profile/name';
import { UpdateRequestNotices } from '@/components/app/update-request-notices';
import { PersonalDdetail } from '@/components/app/profile/personal-detail';
import { Segments } from '@/components/app/profile/segments';
import { WorkHistoryComponent } from '@/components/app/profile/work-history';

import { Candidate } from '@/models/candidate';
import { CandidateEducation } from '@/models/candidate-education';
import { CandidateWorkHistory } from '@/models/candidate-work-history';
import { CandidateExperience } from '@/models/candidate.experience';
import { CandidateSkill } from '@/models/candidate.skill';
import { Certificate } from '@/models/certificate';
import { page, track } from '@/providers/analytics.service';
import { getNextRouteToCompleteProfile, profile } from '@/providers/logged-in/account.service';
import { listWorkHistory } from '@/providers/logged-in/candidate.service';
import { setUser } from '@/store/slices/userSlice';
import { useAppDispatch } from '@/store/store';
import { useAppSelector } from '@/store/store';
import { Ribbon } from 'lucide-react';
import { useIonRouter, useIonViewWillEnter } from '@ionic/react';    
import { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loading from './loading';
import DashLayout from '../layout';
import JobSearchStatus from '@/components/app/job-search-status';
import { CandidateLink } from '@/models/candidate-link';
import CandidateLinkComponent from '@/components/app/profile/candidate-link';
import { IonIcon } from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import { DialogTrigger } from '@/components/ui/dialog';
import { Dialog } from '@/components/ui/dialog';
import { DialogContent } from '@/components/ui/dialog';
import { CandidateLinkForm } from '@/components/app/profile/candidate-link-form';

const ProfilePage = () => { 
    const [loading, setLoading] = useState(false);
    const [segment, setSegment] = useState("work-details");
    const [open, setOpen] = useState(false);
    const [noticeReload, setNoticeReload] = useState(0);
    const [workHistories, setWorkHistories] = useState<CandidateWorkHistory[]>([]);
    const [currentAssignments, setCurrentAssignments] = useState<CandidateWorkHistory[]>([]);   
    const { user } = useAppSelector(state => state.user) as { user: Candidate };
    const dispatch = useAppDispatch();

    const router = useIonRouter();

    const segments = [
        { key: 'work-details', value: 'Work Details' },
        { key: 'personal-details', value: 'Personal Details' }
    ];

    const {t} = useTranslation();

    useIonViewWillEnter(() => {
        setNoticeReload((value) => value + 1);
    });

    useEffect(() => {
        page('Profile Page');

        loadProfile();
        loadWorkHistoryData();

        //router.prefetch('/skills?fromProfile=1');
        //router.prefetch('/educations?fromProfile=1');
        //router.prefetch('/experience?fromProfile=1');
        //router.prefetch('/video?fromProfile=1');

        return () => {
            track('page_exit', { page: 'Profile Page' });
        }
    }, []);

  /*  useEffect(() => {
        loadWorkHistoryData();
    }, [workHistories]);
*/

    const completeProfile = (user: Candidate) => {
            
        const nextRoute: string | undefined = getNextRouteToCompleteProfile(user);
 
        if (nextRoute) {
            router.push('/' + nextRoute);
        } /*else {
            router.push('/profile');
        }*/
    };

    function loadProfile() {
        
      setLoading(true);

      profile().then(res => {
 
        dispatch(setUser({ user: res }));

        if (!res?.isProfileCompleted) {
            completeProfile(res);
        }

      }).finally(() => {
        setLoading(false);
      });
    }

    /**
     * Load candidate work history data
     */
    function loadWorkHistoryData() {
        listWorkHistory().then((response: CandidateWorkHistory[]) => {
            setWorkHistories(response.filter((e: CandidateWorkHistory) => e.end_date != null));
            setCurrentAssignments(response.filter((e: CandidateWorkHistory) => e.end_date == null));
        });
    }
 
    const updateSkillClicked = async () => {
        router.push('/skills?fromProfile=1');
    };

    const updateEducationClicked = async () => {
        router.push('/educations?fromProfile=1');
    };

    const updateExperienceClicked = async () => {
        router.push('/experience?fromProfile=1');
    };
    
    const updateCVClicked = async () => {
        router.push('/video?fromProfile=1');
    };
    
    const updateVideoClicked  = async () => { 
        router.push('/video?fromProfile=1');
    }

    return (
        <Suspense fallback={<Loading />}> 
        <DashLayout>    
        <div className='bg-[#f7f8fa]'>
            {loading && !user && <div className='max-w-4xl mx-auto p-6'>{t("Loading...")}</div>}
            {user && (
                <>
                    <div className=' bg-white'>
                        <div className="max-w-4xl mx-auto px-6 shadow-[0px_10px_20px_0px_rgba(0,0,0,0.05)">
                            <Name />
                            <div className="pb-4">
                                <UpdateRequestNotices reloadToken={noticeReload} />
                            </div>
                            <Segments segments={segments} onChange={(segment) => setSegment(segment)} segment={segment} />
                        </div>    
                    </div>
                    
                    <div className="max-w-4xl mx-auto p-6">

                        {segment === 'work-details' && (
                            <>

                                {/** todo: have resume + video here */}
                                <div className="h-14 justify-start items-start gap-4 inline-flex">

                                    <div onClick={updateCVClicked} className="cursor-pointer p-4 bg-white rounded-lg shadow flex-col justify-start items-start gap-2.5 inline-flex">
                                        <div className="justify-start items-center gap-1 inline-flex">
                                            <div className="w-6 h-6 relative me-1">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12.5 11L12.5 15.9999" stroke="#23233D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M14.5 14.3335L12.5 16.0001L10.5 14.3335" stroke="#23233D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M18.0714 19H6.92857C6.41574 19 6 18.602 6 18.1111L6 3.88889C6 3.39797 6.41574 3 6.92857 3L13.9514 3C14.2101 3 14.457 3.10328 14.6328 3.28497L18.7528 7.54441C18.9117 7.70872 19 7.9244 19 8.14833L19 18.1111C19 18.602 18.5843 19 18.0714 19Z" stroke="#23233D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M19 8H13.9444C13.4842 8 13.1111 7.6269 13.1111 7.16667L13.1111 3" stroke="#23233D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>

                                            </div>
                                            <div className="w-[103px] text-[#4b4b61] text-sm font-medium font-['Inter'] leading-tight">
                                                {t("CV / Portfolio")}
                                            </div>
                                        </div>
                                    </div>

                                    <div onClick={updateVideoClicked} className="cursor-pointer p-4 bg-white rounded-lg shadow flex-col justify-start items-start gap-2.5 inline-flex">
                                        <div className="justify-start items-center gap-1 inline-flex">
                                            <div className="w-6 h-6 relative me-1">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#23233D" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M14.9104 12.4287C15.2341 12.2345 15.2341 11.7655 14.9104 11.5713L10.7572 9.07935C10.424 8.87939 10 9.11945 10 9.5081V14.4919C10 14.8806 10.424 15.1206 10.7572 14.9207L14.9104 12.4287Z" stroke="#23233D" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </div>
                                            <div className="w-[103px] text-[#4b4b61] text-sm font-medium font-['Inter'] leading-tight">
                                                {t("Intro Video")}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <JobSearchStatus candidate={user} />

                                <div className="my-6">
                                    <h5 className='text-[color:var(--Neutral-95,#23233D)] text-lg font-semibold leading-7 my-4'>
                                        <img className='w-6 h-6 inline me-2' src="/assets/icons/icon-link.svg" /> 
                                        {t("Custom Links")}
                                        <div className='inline-block float-end'>
                                            <Dialog open={open} onOpenChange={setOpen}>
                                                <DialogTrigger asChild>
                                                <button className="p-2 bg-white rounded-md outline outline-1 outline-offset-[-1px] outline-slate-200 inline-flex justify-center items-center gap-2">
                                                    <IonIcon icon={addOutline} />
                                                </button>
                                                </DialogTrigger> 
                                                <DialogContent className="sm:max-w-[425px]">
                                                    <CandidateLinkForm onClose={() => setOpen(false)} candidateLink={null} />
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </h5>
                                    { user.candidateLinks?.map((candidateLink: CandidateLink) => (
                                        <CandidateLinkComponent key={candidateLink.cl_uuid} candidateLink={candidateLink} />
                                    ))}
                                </div>

                                {user.certificates && user.certificates.length > 0 && <>
                                    <h5 className='text-[color:var(--Neutral-95,#23233D)] text-lg font-semibold leading-7 my-4'>
                                        <img className='w-6 h-6 inline me-2' src="/assets/images/icon-assignment.svg" /> {t("Certificates")}
                                    </h5>
                                    { user.certificates.map((candidateCertificate: Certificate) => (
                                        <CertificateComponent key={candidateCertificate.certificate_uuid} certificate={candidateCertificate} />
                                    ))}
                                </>}

                                {currentAssignments.length > 0 && <>
                                    <h5 className='text-[color:var(--Neutral-95,#23233D)] text-lg font-semibold leading-7 my-4'>
                                        <img className='w-6 h-6 inline me-2' src="/assets/images/icon-assignment.svg" /> {t("Current Assignments")}
                                    </h5>
                                    { currentAssignments.map((history: any) => (
                                        <Assignment key={history.id} history={history} />
                                    ))}
                                </>}

                                {workHistories.length > 0 && <>
                                    <h5 className='text-[color:var(--Neutral-95,#23233D)] text-lg font-semibold leading-7 my-4'>
                                        <img className='w-6 h-6 inline me-2' src="/assets/images/icon-suitcase.svg" /> {t("Work History")}
                                    </h5>
                                    { workHistories.map((history: any) => (
                                        <WorkHistoryComponent key={history.id} history={history} />
                                    ))}
                                </>}

                                <div className='cursor-pointer' onClick={updateExperienceClicked}>   
                                    <h5 className='text-[color:var(--Neutral-95,#23233D)] text-lg font-semibold leading-7 my-4'>
                                        <img className='w-6 h-6 inline me-2' src="/assets/images/icon-suitcase.svg" /> {t("Experiences")}
                                    </h5>
                                    { user.candidateExperiences?.map((experience: CandidateExperience) => (
                                        <Experience key={experience.candidate_experience_id} experience={experience} />
                                    ))}
                                </div>     

                                <div className='cursor-pointer' onClick={updateSkillClicked}> 
                                    <h5 className='text-[color:var(--Neutral-95,#23233D)] text-lg font-semibold leading-7 my-4'>
                                        <img className='w-6 h-6 inline me-2' src="/assets/images/icon-puzzle.svg" /> {t("Skills")}
                                    </h5>
                                    { user.candidateSkills?.map((candidateSkill: CandidateSkill) => (
                                        <span className='inline-block justify-center items-center gap-2.5  [background:var(--Neutral-0,#FFF)] px-3 py-1.5 rounded-lg
                                            text-[color:var(--Neutral-90,#4B4B61)] me-2 mb-2 text-sm font-medium leading-5' 
                                            key={candidateSkill.candidate_skill_id}>{candidateSkill.skill}</span>
                                    ))}
                                </div>

                                <div className='cursor-pointer' onClick={updateEducationClicked}>
                                <h5 className='text-[color:var(--Neutral-95,#23233D)] text-lg font-semibold leading-7 mb-4 mt-6'>
                                    <Ribbon className='w-6 h-6 inline' /> {t("Educations")}
                                </h5>
                                { user.candidateEducations?.map((candidateEducation: CandidateEducation) => (
                                    <Education key={candidateEducation.education_uuid} education={candidateEducation}></Education>
                                ))}
                                </div>
                            </>
                        )}

                        {segment === 'personal-details' && (
                            <PersonalDdetail />
                        )}
   
                        <div className='clearfix'></div>
                    </div>
                    
                </>
            )}
        </div>
        </DashLayout>   
        </Suspense>
    );
};

export default ProfilePage;