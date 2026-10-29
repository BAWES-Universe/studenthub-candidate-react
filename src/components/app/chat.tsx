import { Chat } from "@/models/chat";
import { useTranslation } from "react-i18next";
import { useTimeAgo } from "@/utils/app";
import { resolvedStoredImageUrl } from "@/utils/stored-image-url";

export function ChatComponent( { chat, onClick, onLogoError }: { chat: Chat, onClick: () => void, onLogoError: (chat: Chat) => void }) {

    const { t} = useTranslation();

    const { timeAgo } = useTimeAgo(chat.created_at || '', t);
     
    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-2 cursor-pointer relative" onClick={onClick}>
            <div className="flex items-center">
                <div className="w-12 h-12 mr-4">
                    <img src={resolvedStoredImageUrl(chat.company?.company_logo_url, chat.company?.company_logo, import.meta.env.VITE_CLOUDINARY_URL) || 'assets/images/building.svg'} 
                        alt="Logo" className="w-full h-full rounded-full" onError={() => onLogoError(chat)} />
                </div>
                <div className="flex-1">
                    <span className="font-semibold">{chat.contact?.contact_name || chat.staff?.staff_name}</span>
                    <p>{chat.recentMessage?.message}</p>
                    <span className="text-gray-500 text-sm">
                        {/** dateTimeFormat(chat.created_at, "h:mm a MMM d, yyyy " */}
                        {timeAgo}</span>

                    {chat.candidateUnreadCount && chat.candidateUnreadCount > 0 && (
                        <span className="bg-red-500 text-white rounded-full px-2 text-xs absolute top-4 end-4">
                            {chat.candidateUnreadCount < 9 ? chat.candidateUnreadCount : '9+'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}