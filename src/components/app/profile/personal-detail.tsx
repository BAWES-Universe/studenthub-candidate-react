import { Area } from "@/models/area";
import { Candidate } from "@/models/candidate";
import { Country } from "@/models/country";
import { useAppSelector } from "@/store/store";
import { calculateAge } from "@/utils/app";
import { dateTimeFormat } from "@/utils/common";
import { useHistory } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function PersonalDdetail()   {

    const { user } = useAppSelector(state => state.user) as { user: Candidate };
    const { t, i18n } = useTranslation();
    const router = useHistory();

    useEffect(() => {
        //router.prefetch("/about-yourself?fromProfile=1");
        //router.prefetch("/objective?fromProfile=1");
        //router.prefetch("/phone-number?fromProfile=1");
        //router.prefetch("/email?fromProfile=1");
        //router.prefetch("/preferred-time?fromProfile=1");
        //router.prefetch("/civil-id?fromProfile=1");
        //router.prefetch("/profile-url?fromProfile=1");
        //router.prefetch("/dob?fromProfile=1");
        //router.prefetch("/driver-license?fromProfile=1");
        //router.prefetch("/gender?fromProfile=1");
        //router.prefetch("/nationality?fromProfile=1");
        //router.prefetch("/area?fromProfile=1");
    }, []);
    
    const updateBioClicked = async () => { 
        router.push('/about-yourself?fromProfile=1', {
            scroll: true
        });
    };

    const updateObjectiveClicked = async () => { 
        router.push('/objective?fromProfile=1', {
            scroll: true
        });
    };

    const updatePhoneClicked = async () => { 
        router.push('/phone-number?fromProfile=1', {
            scroll: true
        });
    };

    const updateEmailClicked = async () => {
        router.push('/email?fromProfile=1', {
            scroll: true
        });
    };

    const updatePreferredTimeClicked = async () => {
        router.push('/preferred-time?fromProfile=1', {
            scroll: true
        });
    };

    const updateCivilIdBackClicked = async () => {
        router.push('/civil-id?fromProfile=1', {
            scroll: true
        });
    };
    const updateCivilIdFrontClicked = async () => {
        router.push('/civil-id?fromProfile=1', {
            scroll: true
        });
    };
    const profilePageClicked = async () => {
        router.push('/profile-url?fromProfile=1', {
            scroll: true
        });
    };
    const updateDateOfBirthClicked = async () => {
        router.push('/dob?fromProfile=1', {
            scroll: true
        });
    };
    const updateDrivingLicenseClicked = async () => {
        router.push('/driver-license?fromProfile=1', {
            scroll: true
        });
    };
    const updateCandidateIdClicked = async () => {
        router.push('/civil-id?fromProfile=1', {
            scroll: true
        });
    };
    const updateGenderClicked = async () => {
        router.push('/gender?fromProfile=1', {
            scroll: true
        });
    };
    const updateKuwaitiNationalStatusClicked = async () => {
        router.push('/nationality?fromProfile=1', {
            scroll: true
        });
    };
    const updateNationalityClicked = async () => {
        router.push('/nationality?fromProfile=1', {
            scroll: true
        });
    };
    const updateAreaClicked = async () => {
        router.push('/area?fromProfile=1', {
            scroll: true
        });
    };

    const area = (area: Area, country: Country) => {
 
        if(i18n.language == 'ar') {
            return (area.area_name_ar?area.area_name_ar:area.area_name_en) + ', ' +
              (country.country_name_ar? country.country_name_ar: country.country_name_en);
        }

        return area.area_name_en + ' ، ' + country.country_name_en;
    };      

    return (
        <div className="flex-col justify-start items-start gap-8 inline-flex">

        <div className="flex-col justify-start items-start gap-2 flex cursor-pointer" onClick={updateBioClicked}>
            <div className="text-[#22223d] text-lg font-semibold leading-7">{t('Bio')}</div>
            <div className="text-[#4b4b61] text-base font-normal leading-normal">
                { user.candidate_intro?user.candidate_intro: t("Write a short brief to introduce yourself")}
            </div>
        </div>
        
        <div className="flex-col justify-start items-start gap-2 flex cursor-pointer" onClick={updateObjectiveClicked}>
            <div className="text-[#22223d] text-lg font-semibold leading-7">{t('Objective')}</div>
            <div className="text-[#4b4b61] text-base font-normal leading-normal">
                { user.candidate_objective? user.candidate_objective: t("Tell us more about yourself. What makes you special?")}
            </div>
        </div>

        <div className="flex-col justify-start items-start gap-4 flex ">
            <div className="text-[#22223d] text-lg font-semibold leading-7">{t('Contact Information')}</div>
            <div className="flex-col justify-start items-start gap-4 flex">

                <div className="self-stretch justify-start items-start gap-4 inline-flex cursor-pointer" onClick={updatePhoneClicked}>
                    <div className="h-6 justify-start items-center gap-2 flex">
                        <div className="w-6 h-6 relative">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.12972 4H5.68421C4.75405 4 4 4.75405 4 5.68421C4 13.5906 10.4094 20 18.3158 20C19.246 20 20 19.246 20 18.3158V15.8703C20 15.1433 19.5574 14.4896 18.8825 14.2197L16.5397 13.2825C15.9334 13.04 15.2429 13.1494 14.7413 13.5674L14.1361 14.0718C13.4297 14.6604 12.3911 14.6133 11.7409 13.9631L10.0369 12.2591C9.38671 11.6089 9.33959 10.5703 9.92822 9.86391L10.4326 9.25869C10.8506 8.75706 10.96 8.06662 10.7175 7.46034L9.78034 5.11753C9.51037 4.44258 8.85666 4 8.12972 4Z" stroke="#23233D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className="text-[#22223d] text-sm font-medium leading-tight">
                        {user.candidate_phone ? user.candidate_phone: t('Phone number (not set)')}
                        </div>
                    </div>
                </div>

                <div className="self-stretch justify-start items-start gap-4 inline-flex cursor-pointer" onClick={updateEmailClicked}>
                    <div className="grow shrink basis-0 h-6 justify-start items-center gap-2 flex">
                        <div className="w-6 h-6 relative">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="4" y="6" width="16" height="12" rx="3" stroke="#23233D" strokeWidth="2"/>
                            <path d="M18.2008 7.75L12.647 12.4528C12.2741 12.7686 11.7275 12.7686 11.3546 12.4528L5.80078 7.75" stroke="#23233D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className="text-[#22223d] text-sm font-medium leading-tight">
                            {user.candidate_email}
                        </div>
                    </div>
                </div>
                
                <div className="justify-start items-center gap-2 inline-flex cursor-pointer" onClick={updatePreferredTimeClicked}>
                    <div className="w-6 h-6 relative">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.12972 4H5.68421C4.75405 4 4 4.75405 4 5.68421C4 13.5906 10.4094 20 18.3158 20C19.246 20 20 19.246 20 18.3158V15.8703C20 15.1433 19.5574 14.4896 18.8825 14.2197L16.5397 13.2825C15.9334 13.04 15.2429 13.1494 14.7413 13.5674L14.1361 14.0718C13.4297 14.6604 12.3911 14.6133 11.7409 13.9631L10.0369 12.2591C9.38671 11.6089 9.33959 10.5703 9.92822 9.86391L10.4326 9.25869C10.8506 8.75706 10.96 8.06662 10.7175 7.46034L9.78034 5.11753C9.51037 4.44258 8.85666 4 8.12972 4Z" stroke="#23233D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <div className="text-[#22223d] text-sm font-medium leading-tight">
                    {user.candidate_preferred_time ?  user.candidate_preferred_time: t('Prefered time to contact (not set)')}
                    </div>
                </div>

            </div>
        </div>
        <div className="self-stretch flex-col justify-start items-start gap-4 flex cursor-pointer">
            <div className="text-[#22223d] text-lg font-semibold leading-7">
                {t('General Information')}
            </div>
            <div className="self-stretch  flex-col justify-start items-start gap-4 flex">

                <div className="justify-start items-center gap-2 inline-flex cursor-pointer" onClick={updateAreaClicked}>
                    <div className="w-6 h-6 relative">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8.00269C10.8954 8.00269 9.99998 8.89794 9.99998 10.0023C9.99998 11.1066 10.8954 12.0019 12 12.0019C13.1045 12.0019 14 11.1066 14 10.0023C14 8.89794 13.1045 8.00269 12 8.00269Z" fill="#23233D"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M8.49998 17.4697C9.20083 18.306 9.94688 19.1029 10.7346 19.8567C11.4446 20.5361 12.5554 20.5361 13.2654 19.8567C14.0531 19.1029 14.7991 18.306 15.4999 17.4697C17.0999 15.5591 19 12.7137 19 10.0023C19.0058 8.14504 18.2684 6.36263 16.9519 5.05229C14.95 3.04894 11.9379 2.44923 9.32105 3.533C6.70424 4.61677 4.99858 7.1704 5 10.0023C5 12.7137 6.89999 15.5591 8.49998 17.4697ZM6.99999 10.0023C7.0033 7.24278 9.23993 5.0066 12 5.0033C14.76 5.0066 16.9966 7.24278 16.9999 10.0023C16.9999 11.167 16.4729 13.1856 13.966 16.19C13.555 16.6793 13.1276 17.1543 12.6844 17.6143C12.3096 18.0032 11.6905 18.0031 11.316 17.6138C10.8729 17.153 10.4456 16.6772 10.035 16.187C7.52699 13.1866 6.99999 11.168 6.99999 10.0023Z" fill="#23233D"/>
                        </svg>
                    </div>
                    <div className="text-[#22223d] text-sm font-medium leading-tight">
                        { user.area && user.country ? <p dangerouslySetInnerHTML={{ 
                            __html: t('txt_lives_in', { area : area(user.area, user.country)}  ) }} />: t('Area you live in (not set)')}
                    </div>
                </div>

                <div className="justify-start items-center gap-2 inline-flex cursor-pointer" onClick={updateNationalityClicked}>
                    <div className="w-6 h-6 relative">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z" stroke="#23233D" strokeWidth="1.8" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4 12H20" stroke="#23233D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 20C13.6569 20 15 16.4183 15 12C15 7.58172 13.6569 4 12 4C10.3431 4 9 7.58172 9 12C9 16.4183 10.3431 20 12 20Z" stroke="#23233D" strokeWidth="1.8" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <div className="text-[#22223d] text-sm font-medium leading-tight">
                        { user.nationality? (
                                (i18n.language == 'ar' && user.nationality.country_nationality_name_ar)?
                                user.nationality.country_nationality_name_ar: user.nationality.country_nationality_name_en
                            ): t("Where are you from?") 
                        }
                    </div>
                </div>

                { user.country && user.nationality &&
                user.country.country_nationality_name_en == 'Kuwaiti' &&
                user.nationality.country_nationality_name_en != 'Kuwaiti' && 
                <div className="justify-start items-center gap-2 inline-flex cursor-pointer" onClick={updateKuwaitiNationalStatusClicked}>
                    <div className="w-6 h-6 relative">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12.5" cy="7.5" r="3.5" stroke="#23233D" strokeWidth="2"/>
                        <path d="M7 19.5C7 16.4624 9.46243 14 12.5 14V14C15.5376 14 18 16.4624 18 19.5V20H7V19.5Z" stroke="#23233D" strokeWidth="2"/>
                        </svg>
                    </div>
                    <div className="text-[#22223d] text-sm font-medium leading-tight">        
                        { user.candidate_mom_kuwaiti == 1 && <span dangerouslySetInnerHTML={{ 
                            __html: t('Mother is <b>Kuwaiti</b>') }}></span> }
                        { user.candidate_mom_kuwaiti == 2 && <span dangerouslySetInnerHTML={{ 
                                __html: t('Mother is <b>not Kuwaiti</b>')}}></span>}
                        { !user.candidate_mom_kuwaiti && <span>{ t("Your mother Kuwaiti?") } </span> }
                    </div>
                </div> }
                
                <div className="justify-start items-center gap-2 inline-flex cursor-pointer" onClick={updateGenderClicked}>
                    <div className="w-6 h-6 relative">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12.5" cy="7.5" r="3.5" stroke="#23233D" strokeWidth="2"/>
                        <path d="M7 19.5C7 16.4624 9.46243 14 12.5 14V14C15.5376 14 18 16.4624 18 19.5V20H7V19.5Z" stroke="#23233D" strokeWidth="2"/>
                        </svg>
                    </div>
                    <div className="text-[#22223d] text-sm font-medium leading-tight">        
                        { user.candidate_gender == 1 && t('Male') } 
                        { user.candidate_gender == 2 && t('Female') } 
                        { user.candidate_gender == 3 && t('Other') } 
                        { !user.candidate_gender && t('Male? Female? Other?') } 
                    </div>
                </div>
        
                <div className="self-stretch justify-start items-start gap-4 inline-flex cursor-pointer" onClick={updateCandidateIdClicked}>
                    <div className="grow shrink basis-0 h-10 justify-start items-start gap-2 flex">
                        <div className="w-6 h-6 relative">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="6" width="18" height="13" rx="3" stroke="#23233D" strokeWidth="2"/>
                            <path d="M10 14L6 14" stroke="#23233D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14 11L6 11" stroke="#23233D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className="w-[262px]">
                            <span className="text-[#22223d] text-sm font-medium leading-tight">
                                {user.candidate_civil_id? user.candidate_civil_id: t('Civil ID (not set)')}
                            </span> 
                            { user.candidate_civil_expiry_date && <><br/><span className="text-[#68687a] text-sm font-normal leading-tight">
                                {t('Expiring on')} {dateTimeFormat(user.candidate_civil_expiry_date, 'MMM d, yyyy')} 
                            </span></> }
                        </div>
                    </div>
                </div>

                <div className="justify-start items-center gap-2 inline-flex cursor-pointer" onClick={updateDrivingLicenseClicked}>
                    <div className="w-6 h-6 relative">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.5207 15.6601C22.4878 15.3564 19.7067 9.69163 18.9656 8.14862L10.4523 8.14842C9.91556 8.41443 9.46117 8.7806 9.03727 9.2375C7.70774 10.6771 7.90895 11.5503 6.05789 12.0198C4.58491 12.3954 2.09344 11.5409 2.11493 15.666H3.32249C3.90488 12.7522 7.87538 12.7522 8.45792 15.666L14.385 15.6662C14.9676 12.7554 18.9321 12.7526 19.5207 15.6601ZM3.32269 16.8149H1.57525C1.27937 16.8149 1.03248 16.5772 1.01724 16.2735C0.873981 13.6225 1.59964 11.4567 4.09111 11.0686C4.42661 11.0185 6.20738 11.1154 6.77459 10.4113C7.25648 9.6602 7.71689 8.99976 8.22923 8.44907C8.62563 8.01719 9.80588 7 10.3334 7H19.3129C19.5173 7 19.7154 7.11578 19.813 7.3193C20.9261 9.60408 24.2775 16.6333 19.5202 16.8179C18.9318 19.7286 14.9673 19.7254 14.3848 16.8147L8.45765 16.8145C7.87526 19.7282 3.90523 19.7287 3.32269 16.8149ZM6.94847 15.0811C5.5397 13.5787 3.41712 15.8885 4.83219 17.4003C6.24411 18.9026 8.36354 16.5928 6.94847 15.0811ZM18.011 15.0811C16.5991 13.5787 14.4766 15.8885 15.8947 17.4003C17.3035 18.9026 19.4259 16.5928 18.011 15.0811Z" fill="#23233D" stroke="#23233D" strokeWidth="0.6"/>
                        </svg>
                    </div>
                    <div className="text-[#22223d] text-sm font-medium leading-tight">
                        { user.candidate_driving_license == 1 && t('Has Driving License') }
                        { user.candidate_driving_license == 2 && t('Has No Driving License') }
                        { (!user.candidate_driving_license || user.candidate_driving_license == 0) && t('Driving License (not set)') }
                    </div>
                </div>
            
                <div className="justify-start items-center gap-2 inline-flex cursor-pointer" onClick={updateDateOfBirthClicked}>
                    <div className="w-6 h-6 relative">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="5" y="6" width="14" height="14" rx="4" stroke="#23233D" strokeWidth="2"/>
                        <path d="M19 11H5" stroke="#23233D" strokeWidth="2"/>
                        <rect x="8" y="3" width="2" height="6" rx="1" fill="#23233D"/>
                        <rect x="14" y="3" width="2" height="6" rx="1" fill="#23233D"/>
                        </svg>
                    </div>
                    <div className="text-[#22223d] text-sm font-medium leading-tight">
                        { user.candidate_birth_date? dateTimeFormat(user.candidate_birth_date, 'MMM d, yyyy') + '(' + calculateAge(user.candidate_birth_date)+')'
                            : t("How old are you?") }
                    </div>
                </div>

                <div className="justify-start items-center gap-2 inline-flex cursor-pointer" onClick={profilePageClicked}>
                    <div className="w-6 h-6 relative">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z" stroke="#23233D" strokeWidth="1.8" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4 12H20" stroke="#23233D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 20C13.6569 20 15 16.4183 15 12C15 7.58172 13.6569 4 12 4C10.3431 4 9 7.58172 9 12C9 16.4183 10.3431 20 12 20Z" stroke="#23233D" strokeWidth="1.8" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <div className="text-[#22223d] text-sm font-medium leading-tight">
                        { user.profile_url? user.profile_url: t("Profie Url (not set)") }
                    </div>
                </div>            

                { user.candidate_created_at && <div className="justify-start items-start gap-2 inline-flex">
                    <div className="w-6 h-6 relative">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="4" width="16" height="16" rx="8" stroke="#23233D" strokeWidth="2"/>
                        <path d="M11 9V11.3425C11 11.6655 11.156 11.9685 11.4188 12.1563L14 14" stroke="#23233D" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <div>
                        <span className="text-[#22223d] text-sm font-medium leading-tight">{t('Created on')} { dateTimeFormat(user.candidate_created_at, 'MMM d, yyyy') }</span>
                        { user.candidate_updated_at && <>
                            <br/><span className="text-[#68687a] text-sm font-normal leading-tight">{t('Updated on')} { dateTimeFormat(user.candidate_updated_at, 'MMM d, yyyy') }</span>
                        </>}
                    </div>
                </div> }

                <div className="justify-start items-start gap-8">
                    <div className="w-full justify-start items-start gap-4 mt-4 cursor-pointer" onClick={updateCivilIdFrontClicked}>
                        <div className="text-[#22223d] text-lg font-semibold mb-4 leading-7">{t('ID Photo Front')}</div>
                        <div className="min-h-[161px] bg-white rounded-2xl">
                            { user.candidate_civil_photo_front && <img src={ import.meta.env.VITE_PERMANENT_BUCKET_URL + 'photos/' + user.candidate_civil_photo_front }
                                className="w-full h-full object-cover rounded-2xl" /> }
                        </div>    
                    </div>
                    <div className="w-full justify-start items-start gap-4 mt-4 cursor-pointer" onClick={updateCivilIdBackClicked}>
                        <div className="text-[#22223d] text-lg font-semibold leading-7 mb-4">{t('ID Photo Back')}</div>
                        <div className="min-h-[161px] bg-white rounded-2xl">
                            { user.candidate_civil_photo_back && <img src={ import.meta.env.VITE_PERMANENT_BUCKET_URL + 'photos/' + user.candidate_civil_photo_back }
                                className="w-full h-full object-cover rounded-2xl" /> }
                        </div>
                    </div>
                </div>

            </div>
        </div>
        </div>
    );
}
