import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { useCalls } from '@stream-io/video-react-native-sdk'
import { router, useSegments } from 'expo-router'

const CallProvider = ({ children }) => {
    const calls = useCalls()
    const call = calls[0]
    const segments = useSegments()
    const isOnCallScreen = segments.some(seg => seg == 'call')

    useEffect(() => {
        if (!call) return

        if (!isOnCallScreen && call.state.callingState === 'ringing') {
            router.push(`/call`)
        }

    }, [call, isOnCallScreen])

    return (
        <>
            {/* Ẩn StatusBar */}
            <StatusBar
                style="light"
                translucent={true}
                backgroundColor="transparent"
                hidden={!!call}
            />
            {children}
            {call && !isOnCallScreen && <Pressable
                onPress={() => router.push(`/call`)}
                style={{
                    position: 'absolute',
                    backgroundColor: 'lightgreen',
                    top: 0,
                    left: 0,
                    right: 0,
                    paddingHorizontal: 10,
                    paddingVertical: 5
                }}>
                <Text>Call: {call?.id} ({call.state.callingState})</Text>
            </Pressable>}

        </>
    )
}

export default CallProvider