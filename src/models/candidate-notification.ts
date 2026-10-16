import { Candidate, CandidateWorkingHour} from "./candidate";
import { CandidateWorkHistory} from "./candidate-work-history";
import { CandidateWorkingDate} from "./candidate-working-date";
import { Company} from "./company";
import { Invitation} from "./invitation";
import { Store } from "./store";
import { Salary } from "./salary";
import { CandidateWorkLogFeedback } from "./candidate-work-log-feedback";
import { Staff } from "./staff";
import { Job } from "./job";


const CN_TYPE_INVITATION = 0;
const CN_TYPE_ASSIGNMENT = 1;
const CN_TYPE_UNASSIGNED = 2;
const CN_TYPE_WORK_APPROVED = 3;
const CN_TYPE_WORK_REJECTED = 4;
const CN_TYPE_TRANSFER_INIT = 5;
const CN_TYPE_TRANSFER_PAID = 6;
const CN_TYPE_TRANSFER_UNPAID = 7;

export class CandidateNotification {
    cn_uuid!:  string;
    candidate_id?: number;
    type?: number;
    candidate_work_history_id?: number;
    candidate_working_date_uuid?: string;
    candidate_working_hour_uuid?: string;
    invitation_uuid?: string;
    request_uuid?: string;
    number?: number;
    company_id?: number;
    store_id?: number; 
    tc_id?: number;
    is_new?: boolean;
    staff_id?: number;
    message?: string;
    created_at!: string;
    updated_at?: string;
     
    candidate?: Candidate;
    candidateWorkHistory?: CandidateWorkHistory;
    candidateWorkingDate?: CandidateWorkingDate;
    candidateWorkingHour?: CandidateWorkingHour;
    company?: Company;
    invitation?: Invitation;
    request?: Request;
    store?: Store;
    staff!: Staff;
    transferCandidate?: Salary;
    job?: Job;
    candidateWorkLogFeedback?: CandidateWorkLogFeedback;
}


