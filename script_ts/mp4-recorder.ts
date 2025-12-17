// MP4 Video Recorder com Canvas e FFmpeg.wasm
interface MP4RecorderOptions {
    width: number;
    height: number;
    fps: number;
    videoBitrate: number;
    audioBitrate: number;
}

class MP4VideoRecorder {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private video: HTMLVideoElement;
    private audioRecorder: MediaRecorder | null = null;
    private frameInterval: number | null = null;
    private frames: ImageData[] = [];
    private audioChunks: Blob[] = [];
    private isRecording = false;
    private options: MP4RecorderOptions;
    private ffmpeg: any = null;

    constructor(video: HTMLVideoElement, options: Partial<MP4RecorderOptions> = {}) {
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

    async initFFmpeg(): Promise<void> {
        if (this.ffmpeg) return;
        
        try {
            // Carregar FFmpeg.wasm via CDN
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.7/dist/ffmpeg.min.js';
            document.head.appendChild(script);
            
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
            });
            
            // @ts-ignore - FFmpeg carregado globalmente
            const { createFFmpeg } = window.FFmpeg;
            
            this.ffmpeg = createFFmpeg({
                log: true,
                corePath: 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/ffmpeg-core.js'
            });
            
            await this.ffmpeg.load();
        } catch (error) {
            console.error('Erro ao carregar FFmpeg:', error);
            throw new Error('FFmpeg não pôde ser carregado');
        }
    }

    async startRecording(stream: MediaStream): Promise<void> {
        if (this.isRecording) return;

        await this.initFFmpeg();
        
        this.frames = [];
        this.audioChunks = [];
        this.isRecording = true;

        // Iniciar gravação de áudio
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) {
            const audioStream = new MediaStream([audioTracks[0]]);
            this.audioRecorder = new MediaRecorder(audioStream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            
            this.audioRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            this.audioRecorder.start(100);
        }

        // Capturar frames com filtros aplicados
        const frameRate = 1000 / this.options.fps;
        this.frameInterval = setInterval(() => {
            this.captureFrame();
        }, frameRate) as unknown as number;
    }

    private captureFrame(): void {
        if (!this.isRecording) return;

        // Aplicar filtros CSS ao contexto do canvas
        this.ctx.filter = this.video.style.filter || 'none';
        
        // Desenhar frame do vídeo no canvas
        this.ctx.drawImage(this.video, 0, 0, this.options.width, this.options.height);
        
        // Capturar dados do frame
        const imageData = this.ctx.getImageData(0, 0, this.options.width, this.options.height);
        this.frames.push(imageData);
    }

    async stopRecording(): Promise<Blob> {
        if (!this.isRecording) throw new Error('Gravação não está ativa');

        this.isRecording = false;

        // Parar captura de frames
        if (this.frameInterval) {
            clearInterval(this.frameInterval);
            this.frameInterval = null;
        }

        // Parar gravação de áudio
        if (this.audioRecorder && this.audioRecorder.state === 'recording') {
            this.audioRecorder.stop();
            await new Promise(resolve => {
                this.audioRecorder!.onstop = resolve;
            });
        }

        // Processar vídeo com FFmpeg
        return await this.processVideo();
    }

    private async processVideo(): Promise<Blob> {
        console.log(`Processando ${this.frames.length} frames para MP4...`);

        // Converter frames para vídeo WebM primeiro
        const webmBlob = await this.framesToWebM();
        
        // Converter áudio para WebM
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

        // Usar FFmpeg para combinar e converter para MP4
        this.ffmpeg.FS('writeFile', 'video.webm', await this.blobToUint8Array(webmBlob));
        
        if (this.audioChunks.length > 0) {
            this.ffmpeg.FS('writeFile', 'audio.webm', await this.blobToUint8Array(audioBlob));
            
            // Combinar vídeo e áudio em MP4
            await this.ffmpeg.run(
                '-i', 'video.webm',
                '-i', 'audio.webm',
                '-c:v', 'libx264',
                '-c:a', 'aac',
                '-preset', 'fast',
                '-crf', '23',
                'output.mp4'
            );
        } else {
            // Apenas vídeo para MP4
            await this.ffmpeg.run(
                '-i', 'video.webm',
                '-c:v', 'libx264',
                '-preset', 'fast',
                '-crf', '23',
                'output.mp4'
            );
        }

        // Ler arquivo MP4 resultante
        const data = this.ffmpeg.FS('readFile', 'output.mp4');
        
        // Limpar arquivos temporários
        this.ffmpeg.FS('unlink', 'video.webm');
        if (this.audioChunks.length > 0) {
            this.ffmpeg.FS('unlink', 'audio.webm');
        }
        this.ffmpeg.FS('unlink', 'output.mp4');

        return new Blob([data.buffer], { type: 'video/mp4' });
    }

    private async framesToWebM(): Promise<Blob> {
        // Criar MediaRecorder para canvas stream
        const canvasStream = this.canvas.captureStream(this.options.fps);
        const recorder = new MediaRecorder(canvasStream, {
            mimeType: 'video/webm;codecs=vp9'
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) chunks.push(event.data);
        };

        // Reproduzir frames capturados no canvas
        recorder.start();
        
        for (let i = 0; i < this.frames.length; i++) {
            this.ctx.putImageData(this.frames[i], 0, 0);
            await new Promise(resolve => setTimeout(resolve, 1000 / this.options.fps));
        }

        recorder.stop();
        
        return new Promise(resolve => {
            recorder.onstop = () => {
                resolve(new Blob(chunks, { type: 'video/webm' }));
            };
        });
    }

    private async fetchFile(blob: Blob): Promise<Uint8Array> {
        const arrayBuffer = await blob.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    }
    
    // Função auxiliar para converter blob em Uint8Array
    private async blobToUint8Array(blob: Blob): Promise<Uint8Array> {
        return this.fetchFile(blob);
    }

    cleanup(): void {
        this.frames = [];
        this.audioChunks = [];
        if (this.frameInterval) {
            clearInterval(this.frameInterval);
        }
    }
}

export { MP4VideoRecorder, MP4RecorderOptions };