import { Store } from './store';
import { Company } from './company';
import { Bank } from './bank';
import { University } from './university';
import { Country } from './country';
import { CandidateExperience } from './candidate.experience';
import { CandidateSkill } from './candidate.skill';
import { Area } from './area';
import { CandidateEducation } from './candidate-education';
import { Certificate } from "./certificate";
import { CandidateTag } from "./candidate-tag";
import { CandidateLink } from "./candidate-link";
export class Candidate {
    employee_id?:number;
    candidate_id?: string;
    candidate_uid?: string;
    store_id?: number;
    bank_id?: number;
    university_id?: number;
    country_id?: number;//nationality
    bank_account_name?: string;
    candidate_iban?: string;
    candidate_name?: string;
    candidate_name_ar?: string;
    candidate_objective?: string;
    candidate_intro?: string;
    candidate_gender?: number;
    candidate_personal_photo?: string;
    candidate_personal_photo_url?: string | null;
    candidate_video?: string;
    candidate_video_processed?: any;
    candidate_email?: string;
    candidate_new_email?: string;
    candidate_phone?: string;
    candidate_address_line1?: string;
    candidate_area_uuid?: string;
    candidate_latitude?: string;
    candidate_longitude?: string;
    candidate_birth_date?: string;
    candidate_civil_id?: string;
    candidate_civil_expiry_date?: string;
    candidate_civil_photo_front?: string;
    candidate_civil_photo_back?: string;
    candidate_driving_license?: number; 
    candidate_resume?: string;
    candidate_hourly_rate?: string;
    candidate_status?: string;
    approved?: number;
    isProfileCompleted?: number;
    age?: string;
    candidate_job_search_status?: any;
    working_hour_count?: any;
    candidate_mom_kuwaiti?: any;
    profile_url?: string;
    candidate_preferred_time?: string;
    currency_code?: string;
    totalInterviewScheduled?: number;
    pendingField?: any[];
    isWorking?: CandidateWorkingHour;
    candidate_created_at!: string; 
    candidate_updated_at?: string;
    enable_two_step_auth?: boolean;
    civilExpired?: any;
    
    tempLocation?: any; //temp profile photo location while photo upload 
    bank_account_needed?: number; //temp profile photo location while photo upload

    store?: Store;
    company?: Company;
    university?: University;
    country?: Country;
    area?: Area;    
    nationality?: Country;
    bank?: Bank;
    certificates ?: Certificate[];
    candidateEducations?: CandidateEducation[];
    candidateExperiences?: CandidateExperience[];
    candidateSkills?: CandidateSkill[];
    candidateTags?: CandidateTag[];
    candidateLinks?: CandidateLink[];
}

export class CandidateWorkingHour {
    candidate_working_hour_uuid?: string;
    candidate_id?: number;
    store_id?: number;
    date?: string;
    start_time?: string;
    end_time?: string;
    total_time?: number;
    start_location_lat?: string;
    start_location_long?: string;
    end_location_lat?: string;
    end_location_long?: string;
    note?: string;
    status?: number;
    created_at?: string;
    updated_at?: string;
    dateListByCandidate?: any[];
    checkIn?: string;
    checkOut?: string;
    dateStatus?: number;
    lastSession?: CandidateWorkingHour;
    firstSession?: CandidateWorkingHour;
}
