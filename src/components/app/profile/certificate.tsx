import { Certificate } from "@/models/certificate";
import { downloadCertificate } from "@/providers/logged-in/candidate.service";
import { dateTimeFormat, langContent } from "@/utils/common";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function CertificateComponent({ certificate }: { certificate: Certificate }) {

    const [isSelected, setIsSelected] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const { t } = useTranslation();

    function toggleSelection() {
        setIsSelected(!isSelected);
    }

    function downloadClicked(certificate: Certificate) {
        
        if (certificate.candidate_work_history_id) {
            setDownloading(true);

            downloadCertificate(certificate.candidate_work_history_id).then(data => {
            }).finally(() => {
                setDownloading(false);
            });
        }
    }

    return (
        <div className="w-full bg-white rounded-lg shadow flex-col  gap-2.5 inline-flex  mb-4">
            <div onClick={() => toggleSelection()} className={ `p-4 cursor-pointer self-stretch justify-start items-center gap-3 inline-flex ${isSelected? 'shadow-[0px_-1px_0px_0px_#E2E2E6_inset]': ''}` }>
                <div className="grow shrink basis-0 h-12 justify-start items-start gap-3 flex">
                    { certificate.company && certificate.company.company_logo && <div className="w-12 h-12 relative">
                        <div className="w-12 h-12 start-0 top-0 absolute bg-[#f4f6ff] rounded-xl"></div>
                        <img className="w-8 h-8 start-[8px] top-[8px] absolute rounded-[44px]" 
                            src={certificate.company.company_logo_url || (import.meta.env.VITE_CLOUDINARY_URL + certificate.company.company_logo)}
                            onError={(e) => { if (certificate.company) {
                                //certificate.company.company_logo = null
                            }; }} /> 
                    </div> }

                    { certificate.company && <div className="grow shrink basis-0 flex-col justify-start items-start gap-1 inline-flex">
                        { certificate.store && <div className="self-stretch text-[#22223d] text-base font-semibold leading-normal">
                            { certificate.store.store_name }</div> }
                        <div className="self-stretch text-[#3f5dca] text-sm font-medium leading-tight">
                            {certificate.company.company_name}
                        </div>
                    </div> }

                    { certificate.exam && <div className="grow shrink basis-0 flex-col justify-start items-start gap-1 inline-flex">
                        <div className="self-stretch text-[#22223d] text-base font-semibold leading-normal">
                            StudentHub
                        </div> 
                        <div className="self-stretch text-[#3f5dca] text-sm font-medium leading-tight">
                            {langContent(certificate.exam.title_en, certificate.exam.title_ar)}
                        </div>
                    </div> }

                </div>
                { isSelected? <ChevronUp className="w-6 h-6 relative origin-top-start stroke-[#7d7d8d]" />:
                    <ChevronDown className="w-6 h-6 relative origin-top-start stroke-[#7d7d8d]" /> }
            </div>

            {isSelected && <div className="p-4 rounded-lg clear-both">
                 
                { certificate.start_date && <p>

                    <img src="/assets/icons/calendar.svg" className="w-6 h-6 inline me-1" />

                    { dateTimeFormat(certificate.start_date, "MMM d, yyyy") }&nbsp;-&nbsp; 
                    {certificate.end_date ? dateTimeFormat(certificate.end_date, "MMM d, yyyy"): t('now')} </p> }
                
                <button disabled={downloading} onClick={() => downloadClicked(certificate)} 
                    className="disabled:opacity-70 w-[133px] h-10 shrink-0 [background:var(--Blue-Tint-1,#F5F7FF)] rounded-lg 
                    text-[color:var(--Primary-Main,#4C70F2)] text-sm font-semibold leading-5 mt-4">
                    <img src="/assets/icons/download.svg" className="inline w-6 " /> {t('Certificate')}
                </button>
            </div> }
        </div>
    );
}