// Configurações de vídeo e controle de formato
export interface VideoConfig {
    preferMP4: boolean;
    fallbackToWebM: boolean;
    quality: 'low' | 'medium' | 'high';
    fps: number;
    width: number;
    height: number;
}

export const defaultVideoConfig: VideoConfig = {
    preferMP4: true,
    fallbackToWebM: true,
    quality: 'medium',
    fps: 30,
    width: 640,
    height: 480
};

export const getQualitySettings = (quality: VideoConfig['quality']) => {
    switch (quality) {
        case 'low':
            return {
                videoBitrate: 1000000, // 1 Mbps
                audioBitrate: 64000,   // 64 kbps
                width: 480,
                height: 360,
                fps: 24
            };
        case 'high':
            return {
                videoBitrate: 4000000, // 4 Mbps
                audioBitrate: 192000,  // 192 kbps
                width: 1280,
                height: 720,
                fps: 30
            };
        default: // medium
            return {
                videoBitrate: 2000000, // 2 Mbps
                audioBitrate: 128000,  // 128 kbps
                width: 640,
                height: 480,
                fps: 30
            };
    }
};

// Função para detectar suporte de MP4 no navegador
export const detectMP4Support = (): boolean => {
    const video = document.createElement('video');
    return video.canPlayType('video/mp4; codecs="avc1.42E01E"') !== '';
};

// Função para detectar suporte de WebCodecs API
export const detectWebCodecsSupport = (): boolean => {
    return typeof window !== 'undefined' && 
           'VideoEncoder' in window && 
           'VideoDecoder' in window;
};

export const getOptimalVideoConfig = (): VideoConfig => {
    const config = { ...defaultVideoConfig };
    
    // Se WebCodecs não estiver disponível, usar WebM
    if (!detectWebCodecsSupport()) {
        config.preferMP4 = false;
        console.log('WebCodecs não suportado, usando WebM');
    }
    
    // Se MP4 não for suportado para reprodução, usar WebM
    if (!detectMP4Support()) {
        config.preferMP4 = false;
        console.log('MP4 não suportado para reprodução, usando WebM');
    }
    
    return config;
};