// Webcam Creative - Código Seguro e Otimizado
'use strict';
// Importar animações simples
import { initializeAnimations, animateCaptureButton, animateCaptureSuccess, animateFilterChange, animateThemeChange, animateCameraSwitch, animateFilterList, animateGalleryPreview } from './animations-simple.js';
// Elementos DOM com verificação de existência
const getElement = (selector) => document.querySelector(selector);
const video = getElement('#webcam-video');
const canvas = getElement('#webcam-canvas');
const webcamOverlay = getElement('#webcam-overlay');
const filtroNomeDesktop = getElement('#filtro-nome');
const filtroStatusOverlay = getElement('#filtro-status-overlay');
const filterListUl = getElement('#filter-list');
const filterCountSpan = getElement('#filter-count');
const btnCapturar = getElement('#btn-capturar');
const btnGravar = getElement('#btn-gravar');
const btnAlternar = getElement('#btn-alternar');
const btnTema = getElement('#btn-modo-claro');
const themeIcon = getElement('#theme-icon');
const headerLogo = getElement('#header-logo');
const galleryModal = getElement('#gallery-modal');
const btnAbrirGaleriaDesktop = getElement('#btn-abrir-galeria-desktop');
const btnAbrirGaleriaPreview = getElement('#btn-abrir-galeria-preview');
const btnFecharModal = getElement('#btn-fechar-modal');
const fotosGrid = getElement('#fotos-grid');
const videosGrid = getElement('#videos-grid');
const fotosCount = getElement('#fotos-count');
const videosCount = getElement('#videos-count');
const tabFotos = getElement('#tab-fotos');
const tabVideos = getElement('#tab-videos');
const mediaPreviewModal = getElement('#media-preview-modal');
const btnFecharPreview = getElement('#btn-fechar-preview');
const previewMedia = getElement('#preview-media');
const previewTitle = getElement('#preview-title');
const previewDate = getElement('#preview-date');
const btnPreviewDownload = getElement('#btn-preview-download');
const btnPreviewShare = getElement('#btn-preview-share');
const btnPreviewDelete = getElement('#btn-preview-delete');
const galleryPreview = getElement('#gallery-preview');
const capturasCount = getElement('#capturas-count');
const lastPhotoTime = getElement('#last-photo-time');
const recordingIndicator = getElement('#recording-indicator');
const recordingControls = getElement('#recording-controls');
const recordingTimer = getElement('#recording-timer');
const btnPauseRecording = getElement('#btn-pause-recording');
const btnStopRecording = getElement('#btn-stop-recording');
if (video)
    video.disablePictureInPicture = true;
// Filtros seguros e otimizados
const filtros = [
    { nome: 'Nenhum', valor: 'none' },
    { nome: 'Tons de Cinza', valor: 'grayscale(100%)' },
    { nome: 'Sépia', valor: 'sepia(100%)' },
    { nome: 'Inverter Cores', valor: 'invert(100%)' },
    { nome: 'Contraste 150%', valor: 'contrast(150%)' },
    { nome: 'Brilho 150%', valor: 'brightness(150%)' },
    { nome: 'Desfoque 5px', valor: 'blur(5px)' },
    { nome: 'Girar Matiz 90°', valor: 'hue-rotate(90deg)' },
    { nome: 'Saturação 200%', valor: 'saturate(200%)' },
    { nome: 'Opacidade 50%', valor: 'opacity(50%)' },
    { nome: 'Meio Cinza + Sépia', valor: 'grayscale(50%) sepia(60%)' },
    { nome: 'Contraste Alto', valor: 'contrast(200%) brightness(80%)' },
    { nome: 'Cores Primárias', valor: 'saturate(500%) contrast(120%)' },
    { nome: 'Noturno Antigo', valor: 'contrast(150%) brightness(80%) sepia(30%)' },
    { nome: 'Alto Contraste P&B', valor: 'grayscale(100%) contrast(250%)' }
];
let filtroAtualIndex = 0;
let streamAtual = null;
let usandoCamFront = true;
let mediaRecorder = null;
let isRecording = false;
let isPaused = false;
let recordedChunks = [];
let timerInterval = null;
// Funções de segurança
const sanitizeText = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};
const isValidDataUrl = (url) => /^data:image\/(png|jpeg|jpg|gif|webp);base64,/.test(url);
const isValidVideoUrl = (url) => /^data:video\/(mp4|webm|ogg);base64,/.test(url) || url.startsWith('blob:');
const showSecureNotification = (message, type = 'success') => {
    console.log(`[${type.toUpperCase()}] ${sanitizeText(message)}`);
};
// Câmera com tratamento seguro de erros
async function iniciarCamera(frontal = true) {
    try {
        if (streamAtual) {
            streamAtual.getTracks().forEach(track => {
                try {
                    track.stop();
                }
                catch (e) {
                    console.warn('Erro ao parar track:', e);
                }
            });
        }
        if (video && webcamOverlay) {
            video.style.display = 'none';
            webcamOverlay.style.display = 'flex';
        }
        aplicarFiltro(filtroAtualIndex, false);
        // Solicitar permissões de áudio e vídeo separadamente
        const constraints = {
            video: {
                facingMode: frontal ? 'user' : 'environment',
                width: { ideal: 1280, max: 1920 },
                height: { ideal: 720, max: 1080 }
            }
            // Áudio será solicitado apenas durante gravação
        };
        streamAtual = await navigator.mediaDevices.getUserMedia(constraints);
        if (video && webcamOverlay && streamAtual) {
            video.srcObject = streamAtual;
            video.style.display = 'block';
            webcamOverlay.style.display = 'none';
        }
    }
    catch (error) {
        console.error("Erro seguro ao iniciar câmera:", error instanceof Error ? error.message : 'Erro desconhecido');
        if (webcamOverlay) {
            webcamOverlay.style.display = 'flex';
        }
        showSecureNotification('Erro ao acessar a câmera. Verifique as permissões.', 'error');
    }
}
// Aplicar filtro com validação
const aplicarFiltro = (index, updateGlobalIndex = true) => {
    if (index < 0 || index >= filtros.length) {
        console.warn('Índice de filtro inválido:', index);
        return;
    }
    const filtro = filtros[index];
    if (updateGlobalIndex) {
        filtroAtualIndex = index;
        animateFilterChange();
    }
    if (video) {
        video.style.filter = filtro.valor;
    }
    updateFilterStatus(filtro.nome);
    renderizarListaFiltros();
};
const updateFilterStatus = (nome) => {
    const safeName = sanitizeText(nome);
    if (filtroNomeDesktop) {
        filtroNomeDesktop.textContent = safeName;
    }
    if (filtroStatusOverlay) {
        filtroStatusOverlay.textContent = `FILTRO: ${safeName.toUpperCase()}`;
    }
};
// Galeria com segurança aprimorada
const getFotos = () => {
    try {
        const stored = localStorage.getItem('fotos');
        if (!stored)
            return [];
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed))
            return [];
        return parsed.filter((foto) => foto &&
            typeof foto.id === 'string' &&
            typeof foto.dataUrl === 'string' &&
            typeof foto.timestamp === 'number' &&
            isValidDataUrl(foto.dataUrl));
    }
    catch (error) {
        console.error('Erro ao recuperar fotos:', error);
        return [];
    }
};
const getVideos = () => {
    try {
        const stored = localStorage.getItem('videos');
        if (!stored)
            return [];
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed))
            return [];
        return parsed.filter((video) => video &&
            typeof video.id === 'string' &&
            typeof video.dataUrl === 'string' &&
            typeof video.timestamp === 'number' &&
            typeof video.duration === 'number' &&
            (isValidVideoUrl(video.dataUrl) || video.dataUrl.startsWith('blob:')));
    }
    catch (error) {
        console.error('Erro ao recuperar vídeos:', error);
        return [];
    }
};
const getAllMedia = () => {
    const fotos = getFotos().map(f => ({ ...f, type: 'foto' }));
    const videos = getVideos().map(v => ({ ...v, type: 'video' }));
    return [...fotos, ...videos].sort((a, b) => b.timestamp - a.timestamp);
};
const renderizarPreview = () => {
    const allMedia = getAllMedia();
    if (!galleryPreview || !lastPhotoTime || !capturasCount)
        return;
    if (allMedia.length === 0) {
        galleryPreview.innerHTML = createEmptyGridHTML('foto');
        lastPhotoTime.textContent = '—';
    }
    else {
        const ultimaMedia = allMedia[0];
        const dataMedia = new Date(ultimaMedia.timestamp);
        const horaMinuto = dataMedia.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        if (ultimaMedia.type === 'foto') {
            const img = document.createElement('img');
            img.src = ultimaMedia.dataUrl;
            img.alt = 'Última foto';
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:1rem;';
            galleryPreview.innerHTML = '';
            galleryPreview.appendChild(img);
        }
        else {
            const video = document.createElement('video');
            video.src = ultimaMedia.dataUrl;
            video.muted = true;
            video.preload = 'metadata';
            video.playsInline = true;
            video.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:1rem;';
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:white;font-size:2rem;background:rgba(0,0,0,0.6);border-radius:50%;width:50px;height:50px;display:flex;align-items:center;justify-content:center;';
            overlay.innerHTML = '<i class="bi bi-play-fill"></i>';
            const container = document.createElement('div');
            container.style.cssText = 'position:relative;width:100%;height:100%;';
            container.appendChild(video);
            container.appendChild(overlay);
            // Adicionar evento de clique para reproduzir
            overlay.addEventListener('click', () => {
                if (video.paused) {
                    video.play();
                    overlay.style.display = 'none';
                }
            });
            video.addEventListener('ended', () => {
                overlay.style.display = 'flex';
            });
            galleryPreview.innerHTML = '';
            galleryPreview.appendChild(container);
        }
        lastPhotoTime.textContent = horaMinuto;
    }
    capturasCount.textContent = allMedia.length.toString().padStart(2, '0');
};
const salvarFoto = (dataUrl) => {
    if (!isValidDataUrl(dataUrl)) {
        showSecureNotification('Formato de imagem inválido', 'error');
        return;
    }
    try {
        const fotos = getFotos();
        const novaFoto = {
            id: `foto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            dataUrl,
            timestamp: Date.now()
        };
        fotos.push(novaFoto);
        localStorage.setItem('fotos', JSON.stringify(fotos));
        renderizarPreview();
        animateGalleryPreview();
        showSecureNotification('Foto capturada com sucesso!');
    }
    catch (error) {
        console.error('Erro ao salvar foto:', error);
        showSecureNotification('Erro ao salvar a foto.', 'error');
    }
};
const salvarVideo = (dataUrl, duration, format = 'webm') => {
    try {
        const videos = getVideos();
        const novoVideo = {
            id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            dataUrl,
            timestamp: Date.now(),
            duration
        };
        videos.push(novoVideo);
        localStorage.setItem('videos', JSON.stringify(videos));
        renderizarPreview();
        animateGalleryPreview();
        showSecureNotification(`Vídeo ${format.toUpperCase()} salvo com sucesso!`);
    }
    catch (error) {
        console.error('Erro ao salvar vídeo:', error);
        showSecureNotification('Erro ao salvar o vídeo.', 'error');
    }
};
// Variável para controlar tab ativa
let activeTab = 'fotos';
let currentPreviewItem = null;
const renderizarGaleria = () => {
    const fotos = getFotos();
    const videos = getVideos();
    // Atualizar contadores
    if (fotosCount)
        fotosCount.textContent = fotos.length.toString();
    if (videosCount)
        videosCount.textContent = videos.length.toString();
    // Converter para MediaItem e renderizar
    const fotosAsMedia = fotos.map(f => ({ ...f, type: 'foto' }));
    const videosAsMedia = videos.map(v => ({ ...v, type: 'video' }));
    // Renderizar fotos
    renderizarGrid(fotosAsMedia, fotosGrid, 'foto');
    // Renderizar vídeos
    renderizarGrid(videosAsMedia, videosGrid, 'video');
};
const renderizarGrid = (items, grid, type) => {
    if (!grid)
        return;
    if (items.length === 0) {
        grid.innerHTML = createEmptyGridHTML(type);
        return;
    }
    const fragment = document.createDocumentFragment();
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.addEventListener('click', () => openMediaPreview(item));
        if (type === 'foto') {
            const img = document.createElement('img');
            img.src = item.dataUrl;
            img.className = 'gallery-item-media';
            img.alt = 'Foto';
            div.appendChild(img);
            const overlay = document.createElement('div');
            overlay.className = 'gallery-item-overlay';
            overlay.innerHTML = '<i class="bi bi-eye"></i>';
            div.appendChild(overlay);
        }
        else {
            const video = document.createElement('video');
            video.src = item.dataUrl;
            video.className = 'gallery-item-media';
            video.muted = true;
            video.preload = 'metadata';
            div.appendChild(video);
            const overlay = document.createElement('div');
            overlay.className = 'gallery-item-overlay';
            overlay.innerHTML = '<i class="bi bi-play-circle"></i>';
            div.appendChild(overlay);
            const info = document.createElement('div');
            info.className = 'gallery-item-info';
            info.textContent = formatDuration(item.duration || 0);
            div.appendChild(info);
        }
        fragment.appendChild(div);
    });
    grid.innerHTML = '';
    grid.appendChild(fragment);
};
const createEmptyGridHTML = (type) => {
    const icon = type === 'foto' ? 'bi-image' : 'bi-play-circle';
    const text = type === 'foto' ? 'Nenhuma foto' : 'Nenhum vídeo';
    const hint = type === 'foto' ? 'Capture fotos usando o botão da câmera' : 'Grave vídeos usando o botão de gravação';
    return `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-dim);">
            <i class="bi ${icon}" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
            <h3 style="margin-bottom: 0.5rem;">${text}</h3>
            <p style="font-size: 0.9rem;">${hint}</p>
        </div>
    `;
};
const switchTab = (tab) => {
    activeTab = tab;
    // Atualizar botões
    if (tabFotos && tabVideos) {
        tabFotos.classList.toggle('active', tab === 'fotos');
        tabVideos.classList.toggle('active', tab === 'videos');
    }
    // Mostrar/ocultar grids
    if (fotosGrid && videosGrid) {
        fotosGrid.style.display = tab === 'fotos' ? 'grid' : 'none';
        videosGrid.style.display = tab === 'videos' ? 'grid' : 'none';
    }
};
const openMediaPreview = (item) => {
    if (!mediaPreviewModal || !previewMedia || !previewTitle || !previewDate)
        return;
    currentPreviewItem = item;
    // Limpar conteúdo anterior
    previewMedia.innerHTML = '';
    // Criar elemento de mídia
    if (item.type === 'foto') {
        const img = document.createElement('img');
        img.src = item.dataUrl;
        img.alt = 'Preview da foto';
        previewMedia.appendChild(img);
        previewTitle.textContent = 'Foto capturada';
    }
    else {
        const video = document.createElement('video');
        video.src = item.dataUrl;
        video.controls = true;
        video.autoplay = false;
        video.playsInline = true;
        previewMedia.appendChild(video);
        previewTitle.textContent = `Vídeo (${formatDuration(item.duration || 0)})`;
    }
    // Atualizar data
    const date = new Date(item.timestamp);
    previewDate.textContent = date.toLocaleString('pt-BR');
    // Abrir modal
    mediaPreviewModal.showModal();
};
const closeMediaPreview = () => {
    if (mediaPreviewModal) {
        mediaPreviewModal.close();
        currentPreviewItem = null;
    }
};
// Funções utilitárias seguras
const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};
const createSecureButton = (iconClass, title, onClick) => {
    const button = document.createElement('button');
    button.title = sanitizeText(title);
    button.type = 'button';
    const icon = document.createElement('i');
    icon.className = `bi ${iconClass}`;
    button.appendChild(icon);
    button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
    });
    return button;
};
const baixarFoto = (dataUrl) => {
    if (!isValidDataUrl(dataUrl)) {
        showSecureNotification('URL de imagem inválida', 'error');
        return;
    }
    try {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `foto-webcam-${Date.now()}.png`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSecureNotification('Download iniciado!');
    }
    catch (error) {
        console.error('Erro ao baixar foto:', error);
        showSecureNotification('Erro ao baixar a foto.', 'error');
    }
};
const baixarVideo = (dataUrl) => {
    try {
        const link = document.createElement('a');
        link.href = dataUrl;
        // Detectar formato baseado no tipo MIME ou URL
        const isMP4 = dataUrl.includes('video/mp4') || dataUrl.includes('.mp4');
        const extension = isMP4 ? 'mp4' : 'webm';
        link.download = `video-webcam-${Date.now()}.${extension}`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSecureNotification('Download do vídeo iniciado!');
    }
    catch (error) {
        console.error('Erro ao baixar vídeo:', error);
        showSecureNotification('Erro ao baixar o vídeo.', 'error');
    }
};
const deletarFoto = (id) => {
    if (!id || typeof id !== 'string') {
        showSecureNotification('ID de foto inválido', 'error');
        return;
    }
    try {
        const fotos = getFotos();
        const atualizadas = fotos.filter(f => f.id !== id);
        localStorage.setItem('fotos', JSON.stringify(atualizadas));
        renderizarPreview();
        renderizarGaleria();
        showSecureNotification('Foto deletada com sucesso!');
    }
    catch (error) {
        console.error('Erro ao deletar foto:', error);
        showSecureNotification('Erro ao deletar a foto.', 'error');
    }
};
const deletarVideo = (id) => {
    if (!id || typeof id !== 'string') {
        showSecureNotification('ID de vídeo inválido', 'error');
        return;
    }
    try {
        const videos = getVideos();
        const atualizados = videos.filter(v => v.id !== id);
        localStorage.setItem('videos', JSON.stringify(atualizados));
        renderizarPreview();
        renderizarGaleria();
        showSecureNotification('Vídeo deletado com sucesso!');
    }
    catch (error) {
        console.error('Erro ao deletar vídeo:', error);
        showSecureNotification('Erro ao deletar o vídeo.', 'error');
    }
};
const compartilharFoto = async (dataUrl) => {
    if (!isValidDataUrl(dataUrl)) {
        showSecureNotification('URL de imagem inválida', 'error');
        return;
    }
    try {
        if (!navigator.share) {
            showSecureNotification('Compartilhamento não suportado neste navegador.', 'error');
            return;
        }
        const response = await fetch(dataUrl);
        if (!response.ok)
            throw new Error('Falha ao processar imagem');
        const blob = await response.blob();
        const file = new File([blob], 'foto.png', { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Minha Foto da Webcam Creative',
                text: 'Confira a foto que capturei!'
            });
        }
        else {
            showSecureNotification('Compartilhamento de arquivos não suportado.', 'error');
        }
    }
    catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Erro no compartilhamento:', error);
            showSecureNotification('Erro ao compartilhar a foto.', 'error');
        }
    }
};
const compartilharVideo = async (dataUrl) => {
    try {
        if (!navigator.share) {
            showSecureNotification('Compartilhamento não suportado neste navegador.', 'error');
            return;
        }
        const response = await fetch(dataUrl);
        if (!response.ok)
            throw new Error('Falha ao processar vídeo');
        const blob = await response.blob();
        // Detectar formato e definir nome/tipo correto
        const isMP4 = blob.type.includes('mp4') || dataUrl.includes('video/mp4');
        const fileName = isMP4 ? 'video.mp4' : 'video.webm';
        const mimeType = isMP4 ? 'video/mp4' : 'video/webm';
        const file = new File([blob], fileName, { type: mimeType });
        if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Meu Vídeo da Webcam Creative',
                text: 'Confira o vídeo que gravei!'
            });
        }
        else {
            showSecureNotification('Compartilhamento de arquivos não suportado.', 'error');
        }
    }
    catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Erro no compartilhamento:', error);
            showSecureNotification('Erro ao compartilhar o vídeo.', 'error');
        }
    }
};
// Funções de gravação de vídeo
let recordingStartTime;
let pausedTime = 0;
const checkMediaRecorderSupport = () => {
    return typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function';
};
const getSupportedMimeType = (withAudio = true) => {
    const typesWithAudio = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp9',
        'video/webm'
    ];
    const typesVideoOnly = [
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4;codecs=h264',
        'video/mp4'
    ];
    if (withAudio) {
        for (const type of typesWithAudio) {
            if (typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(type)) {
                console.log('Codec com áudio suportado:', type);
                return { mimeType: type, supportsAudio: true };
            }
        }
    }
    for (const type of typesVideoOnly) {
        if (typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(type)) {
            console.log('Codec apenas vídeo suportado:', type);
            return { mimeType: type, supportsAudio: false };
        }
    }
    console.log('Usando fallback: video/webm');
    return { mimeType: 'video/webm', supportsAudio: false };
};
// Importar MP4 Recorder e configurações
import { SimpleMP4VideoRecorder } from './simple-mp4-recorder.js';
import { defaultVideoConfig, getQualitySettings, getOptimalVideoConfig } from './video-config.js';
// Variáveis para MP4 recording
let mp4Recorder = null;
let currentVideoConfig = getOptimalVideoConfig();
// Elementos do modal de configuração
const videoConfigModal = getElement('#video-config-modal');
const btnVideoConfig = getElement('#btn-video-config');
const btnFecharConfigModal = getElement('#btn-fechar-config-modal');
const btnSaveConfig = getElement('#btn-save-config');
const btnResetConfig = getElement('#btn-reset-config');
const iniciarGravacao = async () => {
    if (!streamAtual) {
        showSecureNotification('Câmera não ativa.', 'error');
        return;
    }
    if (!checkMediaRecorderSupport()) {
        showSecureNotification('Gravação de vídeo não suportada neste navegador.', 'error');
        return;
    }
    // Usar MP4 recorder se habilitado
    if (currentVideoConfig.preferMP4 && video) {
        return await iniciarGravacaoMP4();
    }
    try {
        recordedChunks = [];
        recordingStartTime = Date.now();
        pausedTime = 0;
        // Solicitar permissão de áudio apenas durante gravação
        let audioStream = null;
        let hasAudio = false;
        try {
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            hasAudio = audioStream.getAudioTracks().length > 0;
            console.log('Áudio capturado para gravação:', hasAudio);
        }
        catch (audioError) {
            console.warn('Áudio não disponível:', audioError);
            hasAudio = false;
        }
        console.log('Stream atual:', {
            videoTracks: streamAtual.getVideoTracks().length,
            audioTracks: hasAudio ? audioStream.getAudioTracks().length : 0,
            hasAudio
        });
        const codecInfo = getSupportedMimeType(hasAudio);
        console.log('Codec selecionado:', codecInfo, 'Com áudio:', hasAudio);
        // Criar novo stream com vídeo e áudio
        const recordingStream = new MediaStream();
        // Adicionar vídeo do stream original
        const videoTracks = streamAtual.getVideoTracks();
        if (videoTracks.length > 0) {
            recordingStream.addTrack(videoTracks[0]);
            console.log('Vídeo adicionado ao stream de gravação');
        }
        // Adicionar áudio se disponível e suportado
        if (hasAudio && audioStream && codecInfo.supportsAudio) {
            const audioTracks = audioStream.getAudioTracks();
            if (audioTracks.length > 0) {
                recordingStream.addTrack(audioTracks[0]);
                console.log('Áudio adicionado ao stream de gravação');
            }
        }
        else if (!hasAudio) {
            console.warn('Gravação apenas com vídeo (áudio não disponível)');
        }
        else if (!codecInfo.supportsAudio) {
            console.warn('Gravação apenas com vídeo (codec não suporta áudio)');
        }
        try {
            mediaRecorder = new MediaRecorder(recordingStream, {
                mimeType: codecInfo.mimeType
            });
        }
        catch (codecError) {
            console.warn('Erro com codec específico, tentando sem opções:', codecError);
            try {
                mediaRecorder = new MediaRecorder(recordingStream);
            }
            catch (fallbackError) {
                throw new Error('MediaRecorder não suportado neste navegador');
            }
        }
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };
        mediaRecorder.onstop = () => {
            console.log('Gravação finalizada, processando vídeo...');
            const mimeType = mediaRecorder?.mimeType || codecInfo.mimeType;
            const blob = new Blob(recordedChunks, { type: mimeType });
            const videoUrl = URL.createObjectURL(blob);
            const duration = (Date.now() - recordingStartTime - pausedTime) / 1000;
            console.log('Vídeo criado:', {
                duration,
                size: blob.size,
                type: mimeType,
                hasAudio: codecInfo.supportsAudio,
                url: videoUrl,
                chunks: recordedChunks.length
            });
            // Parar stream de áudio
            if (audioStream) {
                audioStream.getTracks().forEach(track => track.stop());
                console.log('Stream de áudio finalizado');
            }
            // Testar se o vídeo pode ser reproduzido
            const testVideo = document.createElement('video');
            testVideo.src = videoUrl;
            testVideo.addEventListener('loadedmetadata', () => {
                console.log('Vídeo testável - duração:', testVideo.duration, 'segundos');
            });
            testVideo.addEventListener('error', (e) => {
                console.error('Erro ao testar vídeo:', e);
            });
            salvarVideo(videoUrl, duration, 'webm');
            hideRecordingControls();
        };
        mediaRecorder.onerror = (event) => {
            console.error('Erro no MediaRecorder:', event);
            showSecureNotification('Erro durante a gravação.', 'error');
            hideRecordingControls();
            isRecording = false;
        };
        mediaRecorder.onpause = () => {
            isPaused = true;
            updatePauseButton();
        };
        mediaRecorder.onresume = () => {
            isPaused = false;
            updatePauseButton();
        };
        // Aplicar filtros ao vídeo durante gravação
        if (video) {
            console.log('Filtro aplicado durante gravação:', video.style.filter);
        }
        mediaRecorder.start(100);
        isRecording = true;
        isPaused = false;
        // Mostrar controles de gravação
        showRecordingControls();
        startTimer();
        console.log('Gravação iniciada com sucesso');
        showSecureNotification('Gravação iniciada!');
    }
    catch (error) {
        console.error('Erro ao iniciar gravação:', error);
        hideRecordingControls();
        isRecording = false;
        if (error instanceof Error) {
            if (error.name === 'NotSupportedError') {
                showSecureNotification('Formato de vídeo não suportado pelo navegador.', 'error');
            }
            else if (error.name === 'NotAllowedError') {
                showSecureNotification('Permissão negada para gravação.', 'error');
            }
            else {
                showSecureNotification(`Erro ao iniciar gravação: ${error.message}`, 'error');
            }
        }
        else {
            showSecureNotification('Erro desconhecido ao iniciar gravação.', 'error');
        }
    }
};
const pararGravacao = async () => {
    // Parar gravação MP4
    if (mp4Recorder && isRecording) {
        return await pararGravacaoMP4();
    }
    // Parar gravação WebM tradicional
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        isPaused = false;
        stopTimer();
        showSecureNotification('Gravação finalizada!');
    }
};
// Funções específicas para MP4
const iniciarGravacaoMP4 = async () => {
    if (!streamAtual || !video)
        return;
    try {
        recordingStartTime = Date.now();
        pausedTime = 0;
        // Solicitar áudio apenas durante gravação MP4
        let audioStream = null;
        try {
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Áudio capturado para gravação MP4');
        }
        catch (audioError) {
            console.warn('Áudio não disponível para MP4:', audioError);
        }
        // Combinar streams de vídeo e áudio
        const combinedStream = new MediaStream();
        streamAtual.getVideoTracks().forEach(track => combinedStream.addTrack(track));
        if (audioStream) {
            audioStream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
        }
        // Obter configurações de qualidade
        const qualitySettings = getQualitySettings(currentVideoConfig.quality);
        // Criar novo MP4 recorder
        mp4Recorder = new SimpleMP4VideoRecorder(video, {
            width: qualitySettings.width,
            height: qualitySettings.height,
            fps: qualitySettings.fps,
            videoBitrate: qualitySettings.videoBitrate,
            audioBitrate: qualitySettings.audioBitrate
        });
        await mp4Recorder.startRecording(combinedStream);
        isRecording = true;
        isPaused = false;
        showRecordingControls();
        startTimer();
        showSecureNotification('Gravação MP4 iniciada!');
        console.log('Gravação MP4 iniciada com filtros:', video.style.filter);
    }
    catch (error) {
        console.error('Erro ao iniciar gravação MP4:', error);
        showSecureNotification('Erro ao iniciar gravação MP4', 'error');
        hideRecordingControls();
        isRecording = false;
    }
};
const pararGravacaoMP4 = async () => {
    if (!mp4Recorder || !isRecording)
        return;
    try {
        showSecureNotification('Processando vídeo MP4...');
        const mp4Blob = await mp4Recorder.stopRecording();
        const videoUrl = URL.createObjectURL(mp4Blob);
        const duration = (Date.now() - recordingStartTime - pausedTime) / 1000;
        console.log('Vídeo MP4 criado:', {
            duration,
            size: mp4Blob.size,
            type: 'video/mp4',
            url: videoUrl
        });
        salvarVideo(videoUrl, duration, 'mp4');
        // Cleanup
        mp4Recorder.cleanup();
        mp4Recorder = null;
        isRecording = false;
        isPaused = false;
        stopTimer();
        hideRecordingControls();
        showSecureNotification('Vídeo MP4 salvo com sucesso!');
    }
    catch (error) {
        console.error('Erro ao finalizar gravação MP4:', error);
        showSecureNotification('Erro ao processar vídeo MP4', 'error');
        if (mp4Recorder) {
            mp4Recorder.cleanup();
            mp4Recorder = null;
        }
        isRecording = false;
        hideRecordingControls();
    }
};
const pausarGravacao = () => {
    if (mediaRecorder && isRecording && !isPaused) {
        mediaRecorder.pause();
        pausedTime += Date.now() - recordingStartTime;
        recordingStartTime = Date.now();
        showSecureNotification('Gravação pausada');
    }
};
const retomarGravacao = () => {
    if (mediaRecorder && isRecording && isPaused) {
        mediaRecorder.resume();
        recordingStartTime = Date.now();
        showSecureNotification('Gravação retomada');
    }
};
const showRecordingControls = () => {
    if (recordingIndicator) {
        recordingIndicator.style.display = 'flex';
    }
    if (recordingControls) {
        recordingControls.style.display = 'flex';
    }
};
const hideRecordingControls = () => {
    if (recordingIndicator) {
        recordingIndicator.style.display = 'none';
    }
    if (recordingControls) {
        recordingControls.style.display = 'none';
    }
};
const updatePauseButton = () => {
    if (btnPauseRecording) {
        if (isPaused) {
            btnPauseRecording.innerHTML = '<i class="bi bi-play-fill"></i>';
            btnPauseRecording.title = 'Retomar Gravação';
            btnPauseRecording.classList.add('recording-btn--paused');
        }
        else {
            btnPauseRecording.innerHTML = '<i class="bi bi-pause-fill"></i>';
            btnPauseRecording.title = 'Pausar Gravação';
            btnPauseRecording.classList.remove('recording-btn--paused');
        }
    }
};
const startTimer = () => {
    if (timerInterval)
        clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!isPaused && isRecording) {
            const elapsed = (Date.now() - recordingStartTime + pausedTime) / 1000;
            updateTimerDisplay(elapsed);
        }
    }, 100);
};
const stopTimer = () => {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    if (recordingTimer) {
        recordingTimer.textContent = '00:00';
    }
};
const updateTimerDisplay = (seconds) => {
    if (recordingTimer) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        recordingTimer.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
};
// Funções de canvas removidas - gravação direta do stream
// Lista de filtros otimizada
const renderizarListaFiltros = () => {
    if (!filterListUl || !filterCountSpan)
        return;
    const fragment = document.createDocumentFragment();
    filterCountSpan.textContent = `${filtroAtualIndex + 1}/${filtros.length}`;
    filtros.forEach((filtro, index) => {
        const li = document.createElement('li');
        li.className = `filter-item${index === filtroAtualIndex ? ' filter-item--active' : ''}`;
        const nameSpan = document.createElement('span');
        nameSpan.className = 'filter-item__name';
        nameSpan.textContent = filtro.nome;
        li.appendChild(nameSpan);
        if (index === filtroAtualIndex) {
            const statusSpan = document.createElement('span');
            statusSpan.className = 'filter-item__status';
            statusSpan.textContent = 'ATUAL';
            li.appendChild(statusSpan);
        }
        else {
            const button = document.createElement('button');
            button.className = 'btn btn--apply';
            button.textContent = 'APLICAR';
            button.type = 'button';
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                aplicarFiltro(index);
            });
            li.appendChild(button);
        }
        fragment.appendChild(li);
    });
    filterListUl.innerHTML = '';
    filterListUl.appendChild(fragment);
    // Animar lista após renderização
    setTimeout(() => animateFilterList(), 50);
};
// Funções de configuração de vídeo
const loadVideoConfig = () => {
    try {
        const stored = localStorage.getItem('videoConfig');
        if (stored) {
            const parsed = JSON.parse(stored);
            currentVideoConfig = { ...defaultVideoConfig, ...parsed };
        }
        updateConfigModal();
    }
    catch (error) {
        console.error('Erro ao carregar configurações:', error);
        currentVideoConfig = getOptimalVideoConfig();
    }
};
const saveVideoConfig = () => {
    try {
        localStorage.setItem('videoConfig', JSON.stringify(currentVideoConfig));
        showSecureNotification('Configurações salvas com sucesso!');
    }
    catch (error) {
        console.error('Erro ao salvar configurações:', error);
        showSecureNotification('Erro ao salvar configurações', 'error');
    }
};
const updateConfigModal = () => {
    // Atualizar formato
    const formatMP4 = getElement('#format-mp4');
    const formatWebM = getElement('#format-webm');
    if (formatMP4 && formatWebM) {
        formatMP4.checked = currentVideoConfig.preferMP4;
        formatWebM.checked = !currentVideoConfig.preferMP4;
    }
    // Atualizar qualidade
    const qualityInputs = {
        low: getElement('#quality-low'),
        medium: getElement('#quality-medium'),
        high: getElement('#quality-high')
    };
    Object.entries(qualityInputs).forEach(([quality, input]) => {
        if (input) {
            input.checked = currentVideoConfig.quality === quality;
        }
    });
};
const readConfigFromModal = () => {
    // Ler formato
    const formatMP4 = getElement('#format-mp4');
    if (formatMP4) {
        currentVideoConfig.preferMP4 = formatMP4.checked;
    }
    // Ler qualidade
    const qualityInputs = document.querySelectorAll('input[name="video-quality"]:checked');
    if (qualityInputs.length > 0) {
        const selectedQuality = qualityInputs[0].value;
        currentVideoConfig.quality = selectedQuality;
    }
};
const resetVideoConfig = () => {
    currentVideoConfig = getOptimalVideoConfig();
    updateConfigModal();
    showSecureNotification('Configurações restauradas!');
};
// Detecção de dispositivo móvel
const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 768;
};
// Otimizações para mobile
const setupMobileOptimizations = () => {
    if (isMobile()) {
        // Prevenir zoom em inputs
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });
        // Otimizar scroll
        document.body.style.overscrollBehavior = 'none';
        // Melhorar performance de animações
        document.documentElement.style.setProperty('--transition', 'all 0.15s ease');
        // Adicionar classe mobile
        document.body.classList.add('mobile-device');
        // Configurar orientação
        handleOrientationChange();
        window.addEventListener('orientationchange', handleOrientationChange);
        // Otimizar qualidade de vídeo para mobile
        if (currentVideoConfig) {
            currentVideoConfig.quality = 'medium';
        }
    }
};
const handleOrientationChange = () => {
    setTimeout(() => {
        // Reajustar altura da webcam container
        const container = getElement('.webcam-container');
        if (container) {
            const isLandscape = window.innerHeight < window.innerWidth;
            if (isLandscape && isMobile()) {
                container.style.height = '70vh';
            }
            else if (isMobile()) {
                container.style.height = '50vh';
            }
        }
        // Forçar reflow
        window.dispatchEvent(new Event('resize'));
    }, 100);
};
// Gestos touch para galeria
const setupTouchGestures = () => {
    if (!isMobile())
        return;
    let startX = 0;
    let startY = 0;
    document.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    document.addEventListener('touchend', (e) => {
        if (!startX || !startY)
            return;
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = startX - endX;
        const diffY = startY - endY;
        // Swipe horizontal para trocar tabs na galeria
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (galleryModal && galleryModal.open) {
                if (diffX > 0 && activeTab === 'fotos') {
                    switchTab('videos');
                }
                else if (diffX < 0 && activeTab === 'videos') {
                    switchTab('fotos');
                }
            }
        }
        startX = 0;
        startY = 0;
    });
};
// Otimizar renderização para mobile
const optimizeForMobile = () => {
    if (!isMobile())
        return;
    // Reduzir qualidade de filtros em dispositivos mais fracos
    const isLowEnd = navigator.hardwareConcurrency <= 2 ||
        /Android.*Chrome\/[0-5]/.test(navigator.userAgent);
    if (isLowEnd) {
        document.documentElement.style.setProperty('--shadow', 'rgba(0,0,0,0.2)');
        document.documentElement.style.setProperty('--transition', 'all 0.1s ease');
    }
    // Lazy loading para galeria
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });
    // Aplicar observer a imagens da galeria
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('img[data-src]').forEach(img => {
            observer.observe(img);
        });
    });
};
// Event listeners seguros
const setupSecureEventListeners = () => {
    btnCapturar?.addEventListener('click', (e) => {
        e.preventDefault();
        // Animar botão de captura
        animateCaptureButton();
        if (!streamAtual) {
            showSecureNotification('Câmera não ativa.', 'error');
            return;
        }
        const ctx = canvas?.getContext('2d');
        if (!ctx || !video || !canvas) {
            showSecureNotification('Erro no canvas.', 'error');
            return;
        }
        try {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.filter = video.style.filter || 'none';
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png', 0.9);
            salvarFoto(dataUrl);
            // Animar feedback de sucesso
            animateCaptureSuccess();
        }
        catch (error) {
            console.error('Erro na captura:', error);
            showSecureNotification('Erro ao capturar foto.', 'error');
        }
    });
    btnGravar?.addEventListener('click', (e) => {
        e.preventDefault();
        if (!streamAtual) {
            showSecureNotification('Câmera não ativa.', 'error');
            return;
        }
        if (!isRecording) {
            iniciarGravacao();
            if (btnGravar) {
                btnGravar.innerHTML = '<i class="bi bi-stop-circle"></i>';
                btnGravar.title = 'Parar Gravação';
                btnGravar.classList.add('recording-active');
            }
        }
        else {
            pararGravacao();
            if (btnGravar) {
                btnGravar.innerHTML = '<i class="bi bi-record-circle"></i>';
                btnGravar.title = 'Gravar Vídeo';
                btnGravar.classList.remove('recording-active');
            }
        }
    });
    btnPauseRecording?.addEventListener('click', (e) => {
        e.preventDefault();
        if (!isRecording)
            return;
        if (isPaused) {
            retomarGravacao();
        }
        else {
            pausarGravacao();
        }
    });
    btnStopRecording?.addEventListener('click', (e) => {
        e.preventDefault();
        if (isRecording) {
            pararGravacao();
            if (btnGravar) {
                btnGravar.innerHTML = '<i class="bi bi-record-circle"></i>';
                btnGravar.title = 'Gravar Vídeo';
                btnGravar.classList.remove('recording-active');
            }
        }
    });
    btnAlternar?.addEventListener('click', (e) => {
        e.preventDefault();
        animateCameraSwitch();
        usandoCamFront = !usandoCamFront;
        iniciarCamera(usandoCamFront);
    });
    btnTema?.addEventListener('click', (e) => {
        e.preventDefault();
        animateThemeChange();
        const body = document.body;
        const isDark = body.classList.contains('theme--dark');
        body.classList.toggle('theme--dark', !isDark);
        body.classList.toggle('theme--light', isDark);
        if (themeIcon) {
            themeIcon.className = isDark ? 'bi bi-moon-stars' : 'bi bi-sun';
        }
        if (headerLogo) {
            headerLogo.src = body.classList.contains('theme--light')
                ? '/CSS/img/logo-light.png'
                : '/CSS/img/logo-dark.png';
        }
    });
    // Modal é gerenciado pelas animações
    [btnAbrirGaleriaDesktop, btnAbrirGaleriaPreview].forEach(btn => {
        btn?.addEventListener('click', (e) => {
            e.preventDefault();
            renderizarGaleria();
            // Garantir centralização da galeria em mobile
            if (galleryModal && isMobile()) {
                document.body.style.overflow = 'hidden';
                galleryModal.style.position = 'fixed';
                galleryModal.style.top = '50%';
                galleryModal.style.left = '50%';
                galleryModal.style.transform = 'translate(-50%, -50%)';
            }
        });
    });
    // Configurações de vídeo
    btnVideoConfig?.addEventListener('click', (e) => {
        e.preventDefault();
        updateConfigModal();
        if (videoConfigModal) {
            // Garantir centralização em mobile
            if (isMobile()) {
                document.body.style.overflow = 'hidden';
                videoConfigModal.style.position = 'fixed';
                videoConfigModal.style.top = '50%';
                videoConfigModal.style.left = '50%';
                videoConfigModal.style.transform = 'translate(-50%, -50%)';
            }
            videoConfigModal.showModal();
        }
    });
    btnFecharConfigModal?.addEventListener('click', (e) => {
        e.preventDefault();
        if (videoConfigModal) {
            videoConfigModal.close();
            if (isMobile()) {
                document.body.style.overflow = '';
            }
        }
    });
    btnSaveConfig?.addEventListener('click', (e) => {
        e.preventDefault();
        readConfigFromModal();
        saveVideoConfig();
        if (videoConfigModal) {
            videoConfigModal.close();
            if (isMobile()) {
                document.body.style.overflow = '';
            }
        }
    });
    btnResetConfig?.addEventListener('click', (e) => {
        e.preventDefault();
        resetVideoConfig();
    });
    // Fechar modal clicando fora
    videoConfigModal?.addEventListener('click', (e) => {
        if (e.target === videoConfigModal) {
            videoConfigModal.close();
            if (isMobile()) {
                document.body.style.overflow = '';
            }
        }
    });
    // Fechar galeria
    btnFecharModal?.addEventListener('click', (e) => {
        e.preventDefault();
        if (galleryModal) {
            galleryModal.close();
            if (isMobile()) {
                document.body.style.overflow = '';
            }
        }
    });
    galleryModal?.addEventListener('click', (e) => {
        if (e.target === galleryModal) {
            galleryModal.close();
            if (isMobile()) {
                document.body.style.overflow = '';
            }
        }
    });
    // Sistema de tabs da galeria
    tabFotos?.addEventListener('click', () => switchTab('fotos'));
    tabVideos?.addEventListener('click', () => switchTab('videos'));
    // Modal de preview
    btnFecharPreview?.addEventListener('click', closeMediaPreview);
    mediaPreviewModal?.addEventListener('click', (e) => {
        if (e.target === mediaPreviewModal) {
            closeMediaPreview();
        }
    });
    // Ações do preview
    btnPreviewDownload?.addEventListener('click', () => {
        if (currentPreviewItem) {
            if (currentPreviewItem.type === 'foto') {
                baixarFoto(currentPreviewItem.dataUrl);
            }
            else {
                baixarVideo(currentPreviewItem.dataUrl);
            }
        }
    });
    btnPreviewShare?.addEventListener('click', () => {
        if (currentPreviewItem) {
            if (currentPreviewItem.type === 'foto') {
                compartilharFoto(currentPreviewItem.dataUrl);
            }
            else {
                compartilharVideo(currentPreviewItem.dataUrl);
            }
        }
    });
    btnPreviewDelete?.addEventListener('click', () => {
        if (currentPreviewItem) {
            const confirmDelete = confirm(`Tem certeza que deseja deletar esta ${currentPreviewItem.type}?`);
            if (confirmDelete) {
                if (currentPreviewItem.type === 'foto') {
                    deletarFoto(currentPreviewItem.id);
                }
                else {
                    deletarVideo(currentPreviewItem.id);
                }
                closeMediaPreview();
                renderizarGaleria();
            }
        }
    });
};
const testRecordingSupport = () => {
    console.log('=== TESTE DE SUPORTE DE GRAVAÇÃO ===');
    console.log('MediaRecorder disponível:', typeof MediaRecorder !== 'undefined');
    console.log('isTypeSupported disponível:', typeof MediaRecorder?.isTypeSupported === 'function');
    if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
        const codecsWithAudio = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp9',
            'video/webm'
        ];
        const codecsVideoOnly = [
            'video/webm;codecs=vp8',
            'video/webm',
            'video/mp4;codecs=h264',
            'video/mp4'
        ];
        console.log('--- Codecs com áudio ---');
        codecsWithAudio.forEach(codec => {
            console.log(`${codec}: ${MediaRecorder.isTypeSupported(codec)}`);
        });
        console.log('--- Codecs apenas vídeo ---');
        codecsVideoOnly.forEach(codec => {
            console.log(`${codec}: ${MediaRecorder.isTypeSupported(codec)}`);
        });
        const selectedCodec = getSupportedMimeType(true);
        console.log('Codec selecionado:', selectedCodec);
    }
    // Testar suporte de vídeo HTML5
    const testVideo = document.createElement('video');
    console.log('--- Suporte de Vídeo HTML5 ---');
    console.log('WebM:', testVideo.canPlayType('video/webm'));
    console.log('WebM VP8:', testVideo.canPlayType('video/webm; codecs="vp8"'));
    console.log('WebM VP9:', testVideo.canPlayType('video/webm; codecs="vp9"'));
    console.log('MP4:', testVideo.canPlayType('video/mp4'));
    console.log('=== FIM DO TESTE ===');
};
// Inicialização segura
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Testar suporte de gravação
        testRecordingSupport();
        // Carregar configurações de vídeo
        loadVideoConfig();
        // Inicializar animações primeiro
        initializeAnimations();
        iniciarCamera(usandoCamFront);
        renderizarListaFiltros();
        renderizarPreview();
        setupSecureEventListeners();
        // Configurar otimizações mobile
        setupMobileOptimizations();
        setupTouchGestures();
        optimizeForMobile();
        console.log('Webcam Creative inicializado com segurança e animações');
    }
    catch (error) {
        console.error('Erro na inicialização:', error);
        showSecureNotification('Erro na inicialização da aplicação.', 'error');
    }
});
