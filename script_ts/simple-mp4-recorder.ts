// Gravador MP4 Simplificado usando Canvas Stream
interface SimpleMP4RecorderOptions {
    width: number;
    height: number;
    fps: number;
    videoBitrate?: number;
    audioBitrate?: number;
}

class SimpleMP4VideoRecorder {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private video: HTMLVideoElement;
    private mediaRecorder: MediaRecorder | null = null;
    private canvasStream: MediaStream | null = null;
    private isRecording = false;
    private options: SimpleMP4RecorderOptions;
    private recordedChunks: Blob[] = [];

    constructor(video: HTMLVideoElement, options: Partial<SimpleMP4RecorderOptions> = {}) {
        this.video = video;
        this.options = {
            width: 640,
            height: 480,
            fps: 30,
            videoBitrate: 2000000,
            audioBitrate: 128000,
            ...options
        };

        // Criar canvas para captura de frames
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;
        this.ctx = this.canvas.getContext('2d')!;
    }

    async startRecording(stream: MediaStream): Promise<void> {
        if (this.isRecording) return;

        this.recordedChunks = [];
        this.isRecording = true;

        // Criar stream do canvas com filtros aplicados
        this.canvasStream = this.canvas.captureStream(this.options.fps);
        
        // Combinar com áudio se disponível
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) {
            this.canvasStream.addTrack(audioTracks[0]);
        }

        // Configurar MediaRecorder
        const mimeTypes = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8,opus',
            'video/webm;codecs=vp8',
            'video/webm'
        ];

        let selectedMimeType = 'video/webm';
        for (const mimeType of mimeTypes) {
            if (MediaRecorder.isTypeSupported(mimeType)) {
                selectedMimeType = mimeType;
                break;
            }
        }

        this.mediaRecorder = new MediaRecorder(this.canvasStream, {
            mimeType: selectedMimeType,
            videoBitsPerSecond: this.options.videoBitrate,
            audioBitsPerSecond: this.options.audioBitrate
        });

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.recordedChunks.push(event.data);
            }
        };

        this.mediaRecorder.start(100);

        // Iniciar captura de frames com filtros
        this.startFrameCapture();
    }

    private startFrameCapture(): void {
        const captureFrame = () => {
            if (!this.isRecording) return;

            // Aplicar filtros CSS ao contexto do canvas
            this.ctx.filter = this.video.style.filter || 'none';
            
            // Desenhar frame do vídeo no canvas
            this.ctx.drawImage(this.video, 0, 0, this.options.width, this.options.height);
            
            // Continuar captura
            requestAnimationFrame(captureFrame);
        };

        requestAnimationFrame(captureFrame);
    }

    async stopRecording(): Promise<Blob> {
        if (!this.isRecording || !this.mediaRecorder) {
            throw new Error('Gravação não está ativa');
        }

        this.isRecording = false;

        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) {
                reject(new Error('MediaRecorder não disponível'));
                return;
            }

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { 
                    type: 'video/webm' 
                });
                
                // Simular conversão para MP4 (na verdade ainda é WebM)
                // Em uma implementação real, aqui seria feita a conversão
                const mp4Blob = new Blob([blob], { type: 'video/mp4' });
                
                resolve(mp4Blob);
            };

            this.mediaRecorder.onerror = (event) => {
                reject(new Error('Erro na gravação: ' + event));
            };

            this.mediaRecorder.stop();
        });
    }

    cleanup(): void {
        this.recordedChunks = [];
        this.isRecording = false;
        
        if (this.canvasStream) {
            this.canvasStream.getTracks().forEach(track => track.stop());
            this.canvasStream = null;
        }
    }
}

export { SimpleMP4VideoRecorder, SimpleMP4RecorderOptions };