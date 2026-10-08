import { Button } from "@/components/ui/button";
import { Candidate } from "@/models/candidate";
import { useAppSelector } from "@/store/store";
import { MoreVertical } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { CandidateAction } from "./action";
import { useHistory } from 'react-router-dom';
import { useEffect, useState } from "react";
import { personalPhotoSrc, retainPhotoKeyAfterLoadError } from "@/providers/logged-in/profile-photo-display";
import { IonBadge, IonIcon } from "@ionic/react";
import { useTranslation } from "react-i18next";

export function Name() {

    const { user } = useAppSelector(state => state.user) as { user: Candidate };
    const router = useHistory();

    const [isActionOpen, setIsActionOpen] = useState(false);
    const [photoFailed, setPhotoFailed] = useState(false);
    
    const { t } = useTranslation();
    
    useEffect(() => {
        setPhotoFailed(false);
    }, [user?.candidate_personal_photo, user?.candidate_personal_photo_url]);
    
    const updateNameClicked = async () => {
        router.push('/name?fromProfile=1', {
            scroll: true
        });
    };

    const updatePhotoClicked = async () => {
        router.push('/personal-photo?fromProfile=1', {
            scroll: true
        });
    };

    return (
        <div className="w-full h-20 justify-start items-center gap-4 inline-flex mt-4">
            <div className="w-20 h-20 relative rounded-[44px] cursor-pointer overflow-hidden" onClick={updatePhotoClicked}>
            { user.candidate_personal_photo && !photoFailed && user.candidate_personal_photo_url
                ? <img src={personalPhotoSrc(user)} onError={() => {
                    retainPhotoKeyAfterLoadError(user);
                    setPhotoFailed(true);
                  }} />
                : <img src={personalPhotoSrc(null)} /> }
            </div>
            <div className="grow shrink basis-0 flex-col justify-start items-start gap-1 inline-flex">
                <div className="w-full justify-start items-center gap-6 inline-flex">
                    <div className="grow shrink basis-0 text-[#22223d] text-2xl font-bold leading-loose">
                        <span className="cursor-pointer whitespace-nowrap" onClick={updateNameClicked}>{user.candidate_name}</span>
 
                        { user.isProfileCompleted ? 
                            <IonIcon src="assets/images/ic_verified.svg" className="m-1 relative top-1.5" title="Completed Profile"></IonIcon>: 
                            <IonBadge color="warning" className="m-1 relative top-1.5 bg-red-500 hidden">
                              { t("Incomplete profile") }
                            </IonBadge> }
                    </div>
                </div>
                <div className="justify-start items-center gap-6 inline-flex">
                    <div className="grow shrink basis-0 text-[#22223d] text-base font-bold leading-normal cursor-pointer" onClick={updateNameClicked}>
                        {user.candidate_name_ar} 
                    </div>
                </div>
            </div>

            <Popover open={isActionOpen} onOpenChange={setIsActionOpen}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" className="float-end">
                        <MoreVertical size={24} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-50 p-0">
                    <CandidateAction onClose={() => { setIsActionOpen(false)}} />
                </PopoverContent>
            </Popover>

        </div>
    )
}