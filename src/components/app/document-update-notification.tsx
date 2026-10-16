import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CandidateNotification } from '@/models/candidate-notification';
import { dateTimeFormat } from '@/utils/common';
import { activityActionHref } from '@/providers/logged-in/update-request-notices';

export default function DocumentUpdateNotification({
    candidateNotification,
    onClick,
}: {
    candidateNotification: CandidateNotification;
    onClick: () => void;
}) {
    const { t } = useTranslation();
    const [isNew, setIsNew] = useState(candidateNotification.is_new);
    const href = activityActionHref(candidateNotification.type);
    const title = candidateNotification.type === 12
        ? t('Please upload a new profile photo.')
        : t('Please update your Civil ID.');

    return (
        <div
            onClick={() => {
                onClick();
                setIsNew(false);
            }}
            className={`${isNew ? 'cursor-pointer' : ''} card p-3 flex flex-col gap-1 rounded-lg bg-white shadow-md relative`}
        >
            <h5 className="text-gray-900 font-semibold text-lg leading-7 m-0">{title}</h5>
            {href ? (
                <Link to={href} className="text-sm text-[#4C70F2]">
                    {candidateNotification.type === 12 ? t('Update profile photo') : t('Update Civil ID')}
                </Link>
            ) : null}
            <p className="txt-time text-end text-gray-500 text-xs leading-4 m-0">
                {candidateNotification.created_at ? dateTimeFormat(candidateNotification.created_at, 'MMM d') : ''}
            </p>
            {isNew && (
                <span className="unread w-3.5 h-3.5 bg-blue-500 absolute top-3 end-4 rounded-full"></span>
            )}
        </div>
    );
}
