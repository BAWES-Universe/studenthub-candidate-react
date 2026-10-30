import i18n from "@/18n";
import { CandidateWorkHistory } from "@/models/candidate-work-history";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import { resolvedStoredImageUrl } from "@/utils/stored-image-url";
import { useTranslation } from "react-i18next";

export function Assignment({ history }: { history: CandidateWorkHistory }) {
    const { t } = useTranslation();
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const logoSrc = resolvedStoredImageUrl(history.company?.company_logo_url, history.company?.company_logo, import.meta.env.VITE_CLOUDINARY_URL);
    const logoFailed = !!logoSrc && failedSrc === logoSrc;
    const router = useHistory();

    useEffect(() => {
        //router.prefetch("/assignment/[id]");
    }, []);
    
    return (
        <div onClick={() => router.push('/assignment/' + history.id)} className="cursor-pointer w-full p-4 bg-white rounded-lg shadow flex-col justify-start items-start gap-2.5 inline-flex mb-4">
            <div className="self-stretch justify-start items-center gap-3 inline-flex">
                <div className="grow shrink basis-0 h-12 justify-start items-start gap-3 flex">
                    { logoSrc && !logoFailed && <div className="w-12 h-12 relative">
                        <div className="w-12 h-12 start-0 top-0 absolute bg-[#f4f6ff] rounded-xl"></div>
                        <img className="w-8 h-8 start-[8px] top-[8px] absolute rounded-[44px]" 
                            src={logoSrc}
                            onError={() => setFailedSrc(logoSrc)} /> 
                    </div> }

                    <div className="grow shrink basis-0 flex-col justify-start items-start gap-1 inline-flex">
                        { history.store && <div className="self-stretch text-[#22223d] text-base font-semibold leading-normal">
                            { history.store.store_name }</div> }
                        <div className="self-stretch text-[#3f5dca] text-sm font-medium leading-tight">{history.company.company_name}</div>
                    </div>
                </div>
                { i18n.language == "ar"? <ChevronLeft className="w-6 h-6 relative origin-top-start stroke-[#7d7d8d]" />: 
                    <ChevronRight className="w-6 h-6 relative origin-top-start stroke-[#7d7d8d]" /> }
            </div>
        </div>
    );
}