
import React, { useEffect, useState } from 'react'
import { useApp } from './AppContext';
import { getUserImageSrc } from '@/services/imageService';
import { StreamVideo, StreamVideoClient } from '@stream-io/video-react-native-sdk';
import { chatMessagingApiKey } from '@/constants';
import { tokenProvider } from '@/utils/tokenProvider';
const VideoProvider = ({ children }) => {
    const [videoClient, setVideoClient] = useState(new StreamVideoClient({ apiKey: chatMessagingApiKey }));
    const { user } = useApp();

    useEffect(() => {
        const initVideoClient = async () => {
            if (user?.id) {
                const token = await tokenProvider();
                const client = new StreamVideoClient({
                    apiKey: chatMessagingApiKey,
                    user: {
                        id: user.id,
                        name: user.name,
                        image: getUserImageSrc(user.image)?.uri,
                    },
                    token,
                });



                setVideoClient(client);
            }
        }

        initVideoClient()

        return () => {
            if (videoClient) {
                videoClient.disconnectUser()
            }
        }
    }, [JSON.stringify(user)])

    return (
        <StreamVideo client={videoClient}>
            {children}
        </StreamVideo>
    )
}

export default VideoProvider