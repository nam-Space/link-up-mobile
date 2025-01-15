import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer'
import { supabase } from '@/lib/supabase';
import { supabaseUrl } from '@/constants';

export const getUserImageSrc = imagePath => {
    if (imagePath) {
        return getSupabaseFileUri(imagePath)
    }
    return require('@/assets/images/defaultUser.png')
}

export const getSupabaseFileUri = filePath => {
    if (filePath) {
        return {
            uri: `${supabaseUrl}/storage/v1/object/public/uploads/${filePath}`
        }
    }
    return null
}

export const downloadFile = async (url) => {
    try {
        const { uri } = await FileSystem.downloadAsync(url, getLocalFilePath(url))
        return uri
    } catch (error) {
        return null
    }
}

export const getLocalFilePath = filePath => {
    let fileName = filePath.split('/').pop()
    return `${FileSystem.documentDirectory}${fileName}`
}

export const uploadFile = async (folderName, fileUri, isImage = true) => {
    try {
        let fileName = getFilePath(folderName, isImage)
        const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64
        })
        let imageData = decode(fileBase64)
        const { data, error } = await supabase
            .storage
            .from('uploads')
            .upload(fileName, imageData, {
                contentType: isImage ? 'image/*' : 'video/*',
                cacheControl: '3600',
                upsert: false
            })

        if (error) {
            console.log('uploadFile error: ', error)
            return { success: false, msg: 'Could not upload media' }
        }

        return { success: true, data: data.path }
    } catch (error) {
        console.log('uploadFile error: ', error)
        return { success: false, msg: 'Could not upload media' }
    }
}

export const getFilePath = (folderName, isImage) => {
    return `/${folderName}/${new Date().getTime()}${isImage ? '.png' : '.mp4'}`
}

export const isLocalFile = file => {
    if (!file) return null;
    if (typeof file == 'object') return true
    return false
}

export const getFileType = (file) => {
    if (!file) return null
    if (isLocalFile(file)) return file.type
    if (file.includes('postImage')) return 'image';
    return 'video'
}

export const getFileUri = file => {
    if (!file) return null
    if (isLocalFile(file)) return file.uri;
    return getSupabaseFileUri(file)?.uri;
}