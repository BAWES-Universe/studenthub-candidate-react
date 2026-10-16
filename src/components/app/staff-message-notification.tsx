import { KeyboardEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { CandidateNotification } from "@/models/candidate-notification";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export default function StaffMessageNotification({ candidateNotification, onClick }: {
    candidateNotification: CandidateNotification,
    onClick: any
}) {
    const { t } = useTranslation();
    const [isNew, setIsNew] = useState(candidateNotification.is_new);

    const handleRead = () => {
        onClick();
        setIsNew(false);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== "Enter" && event.key !== " ") {
            return;
        }
        event.preventDefault();
        handleRead();
    };

    return (
        <Card
            className="p-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            role="button"
            tabIndex={0}
            onClick={handleRead}
            onKeyDown={handleKeyDown}
        >
            <CardHeader>
                <CardTitle className="font-bold flex items-center gap-2">
                    {isNew ? <span className="inline-block h-2 w-2 rounded-full bg-red-500" /> : null}
                    {t('Message from StudentHub')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="whitespace-pre-wrap">{candidateNotification.message}</p>
            </CardContent>
        </Card>
    );
}
