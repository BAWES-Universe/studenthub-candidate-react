import { useState } from "react";
import { CandidateNotification } from "@/models/candidate-notification";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export default function StaffMessageNotification({ candidateNotification, onClick }: {
    candidateNotification: CandidateNotification,
    onClick: any
}) {
    const [isNew, setIsNew] = useState(candidateNotification.is_new);

    return (
        <Card className="p-0 cursor-pointer" onClick={() => {
            onClick();
            setIsNew(false);
        }}>
            <CardHeader>
                <CardTitle className="font-bold flex items-center gap-2">
                    {isNew ? <span className="inline-block h-2 w-2 rounded-full bg-red-500" /> : null}
                    Message from StudentHub
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="whitespace-pre-wrap">{candidateNotification.message}</p>
            </CardContent>
        </Card>
    );
}
