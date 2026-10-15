import { CandidateNotification } from "@/models/candidate-notification";
import WorkHourRejected from "./work-hour-rejected";
import WorkHourApproved from "./work-hour-approved";
import WorkSessionApproved from "./work-session-approved";
import WorkSessionRejected from "./work-session-rejected";
import InvitationNotification from "./invitation-notification";
import Assigned from "./assigned";
import Unassigned from "./unassigned";
import TransferInit from "./transfer-init";
import TransferPaid from "./transfer-paid";
import TransferUnpaid from "./transfer-unpaid";
import ApplicationShortlisted from "./application-shortlisted";
import ApplicationRejected from "./application-rejected";
import DocumentUpdateNotification from "./document-update-notification";
import StaffMessageNotification from "./staff-message-notification";

export function Activity({candidateNotification, markRead}: {candidateNotification: CandidateNotification, markRead: any}) {
    return (

        <div className="mb-4" key={candidateNotification.cn_uuid}>
        {
        candidateNotification.type == 3 ? <WorkHourApproved 
onClick={() => markRead(candidateNotification)}
candidateNotification={candidateNotification as any}></WorkHourApproved>: null
        } 
  
        {
            candidateNotification.type == 4 ? <WorkHourRejected 
    onClick={() => markRead(candidateNotification)}
      candidateNotification={candidateNotification as any }></WorkHourRejected>: null 
        }

        {
            candidateNotification.type == 8 ? <WorkSessionApproved 
    onClick={() => markRead(candidateNotification)}
    candidateNotification={candidateNotification as any}></WorkSessionApproved>: null}
      
  {
            candidateNotification.type == 9 ? <WorkSessionRejected 
    onClick={() => markRead(candidateNotification)}
      candidateNotification={candidateNotification as any}></WorkSessionRejected>: null }
      
  {
            candidateNotification.type == 0 ? <InvitationNotification 
    onClick={() => markRead(candidateNotification)}
      candidateNotification={candidateNotification as any}></InvitationNotification>: null
  }

  {
            candidateNotification.type == 1 ? <Assigned 
  onClick={() => markRead(candidateNotification)}
    candidateNotification={candidateNotification as any }></Assigned>: null
  }
  
  {
            candidateNotification.type == 2 ? <Unassigned 
  onClick={() => markRead(candidateNotification)}
      candidateNotification={candidateNotification as any }></Unassigned>: null }

  {
            candidateNotification.type == 5 ? <TransferInit 
  onClick={() => markRead(candidateNotification)}
      candidateNotification={candidateNotification as any }></TransferInit>: null
  }

  {
            candidateNotification.type == 6 ? <TransferPaid 
  onClick={() => markRead(candidateNotification)}
        candidateNotification={candidateNotification as any}></TransferPaid>: null
  }

  {
            candidateNotification.type == 7 ? <TransferUnpaid 
  onClick={() => markRead(candidateNotification)}
      candidateNotification={candidateNotification as any }></TransferUnpaid>: null
  }

  {
    candidateNotification.type == 10 ? <ApplicationShortlisted 
      onClick={() => markRead(candidateNotification)}
      candidateNotification={candidateNotification as any }></ApplicationShortlisted>: null
  }

  {
    candidateNotification.type == 11 ? <ApplicationRejected 
      onClick={() => markRead(candidateNotification)}
      candidateNotification={candidateNotification as any }></ApplicationRejected>: null
  }

  {
    candidateNotification.type == 12 || candidateNotification.type == 13 ? <DocumentUpdateNotification
      onClick={() => markRead(candidateNotification)}
      candidateNotification={candidateNotification}
    ></DocumentUpdateNotification> : null
  }

  {
    candidateNotification.type == 14 ? <StaffMessageNotification
      onClick={() => markRead(candidateNotification)}
      candidateNotification={candidateNotification}
    ></StaffMessageNotification> : null
  }

  { /*
            candidateNotification.type == 10 ? <ion-card *ngSwitchDefault tappable
  onClick={() => markRead(candidateNotification)}
    candidateNotification={candidateNotification}> 
    <ion-card-content>
      {{ candidateNotification.message }}
    </ion-card-content>
  </ion-card>: null */ }

    </div> 
    )
}