import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingAuthCallback() {
    return (
        <>
            <Skeleton className="mx-auto mt-[102px] h-[40px] w-[30%] mb-[0px] text-center text-[40px] font-bold leading-[56px]" />

            <Skeleton className="mx-auto mt-4 h-[40px] w-[40%] mb-4 text-center text-[40px] font-bold leading-[56px]" />

            <Skeleton className="mx-auto text-[#4B4B61] h-6 w-[80%] text-center text-base font-normal leading-6 mb-[40px] mt-[8px]" />
        </>
    )
}
