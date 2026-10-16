import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { listNotifications } from '@/providers/logged-in/candidate-notification.service';
import { loadDocumentReminders } from '@/providers/logged-in/update-request-notices';

export function UpdateRequestNotices({ reloadToken = 0 }: { reloadToken?: number }) {
    const { t } = useTranslation();
    const [notices, setNotices] = useState({ photo: false, civil: false });

    useEffect(() => {
        let active = true;

        loadDocumentReminders(listNotifications).then((reminders) => {
            if (!active) {
                return;
            }
            setNotices(reminders);
        }).catch(() => {
            if (active) {
                setNotices({ photo: false, civil: false });
            }
        });

        return () => {
            active = false;
        };
    }, [reloadToken]);

    if (!notices.photo && !notices.civil) {
        return null;
    }

    return (
        <>
            {notices.photo && (
                <Card className="p-0 mb-4">
                    <CardHeader>
                        <CardTitle className="font-bold">
                            {t('Please upload a new profile photo.')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Link to="/personal-photo?fromProfile=1">
                            <Button variant="outline">{t('Update profile photo')}</Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
            {notices.civil && (
                <Card className="p-0 mb-4">
                    <CardHeader>
                        <CardTitle className="font-bold">
                            {t('Please update your Civil ID.')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Link to="/civil-id?fromProfile=1">
                            <Button variant="outline">{t('Update Civil ID')}</Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </>
    );
}
