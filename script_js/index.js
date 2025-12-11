// Webcam Creative - Código Seguro e Otimizado
'use strict';
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
const btnAlternar = getElement('#btn-alternar');
const btnTema = getElement('#btn-modo-claro');
const themeIcon = getElement('#theme-icon');
const headerLogo = getElement('#header-logo');
const galleryModal = getElement('#gallery-modal');
const btnAbrirGaleriaDesktop = getElement('#btn-abrir-galeria-desktop');
const btnAbrirGaleriaPreview = getElement('#btn-abrir-galeria-preview');
const btnFecharModal = getElement('#btn-fechar-modal');
const galeriaGrid = getElement('#galeria-grid');
const galleryPreview = getElement('#gallery-preview');
const capturasCount = getElement('#capturas-count');
const lastPhotoTime = getElement('#last-photo-time');
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
// Funções de segurança
const sanitizeText = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};
const isValidDataUrl = (url) => /^data:image\/(png|jpeg|jpg|gif|webp);base64,/.test(url);
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
        const constraints = {
            video: {
                facingMode: frontal ? 'user' : 'environment',
                width: { ideal: 1280, max: 1920 },
                height: { ideal: 720, max: 1080 }
            },
            audio: false
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
const renderizarPreview = () => {
    const fotos = getFotos();
    if (!galleryPreview || !lastPhotoTime || !capturasCount)
        return;
    if (fotos.length === 0) {
        galleryPreview.innerHTML = createEmptyGalleryHTML();
        lastPhotoTime.textContent = '—';
    }
    else {
        const ultimaFoto = fotos[fotos.length - 1];
        const dataFoto = new Date(ultimaFoto.timestamp);
        const horaMinuto = dataFoto.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        const img = document.createElement('img');
        img.src = ultimaFoto.dataUrl;
        img.alt = 'Última foto';
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:1rem;';
        galleryPreview.innerHTML = '';
        galleryPreview.appendChild(img);
        lastPhotoTime.textContent = horaMinuto;
    }
    capturasCount.textContent = fotos.length.toString().padStart(2, '0');
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
        showSecureNotification('Foto capturada com sucesso!');
    }
    catch (error) {
        console.error('Erro ao salvar foto:', error);
        showSecureNotification('Erro ao salvar a foto.', 'error');
    }
};
const renderizarGaleria = () => {
    const fotos = getFotos().reverse();
    if (!galeriaGrid)
        return;
    if (fotos.length === 0) {
        galeriaGrid.innerHTML = createEmptyGalleryHTML();
        return;
    }
    const fragment = document.createDocumentFragment();
    fotos.forEach(foto => {
        const div = document.createElement('div');
        div.className = 'img_galeria_content';
        const img = document.createElement('img');
        img.src = foto.dataUrl;
        img.draggable = false;
        img.alt = 'Foto da Galeria';
        const botoesDiv = document.createElement('div');
        botoesDiv.className = 'botoes';
        botoesDiv.appendChild(createSecureButton('bi-download', 'Baixar', () => baixarFoto(foto.dataUrl)));
        botoesDiv.appendChild(createSecureButton('bi-share', 'Compartilhar', () => compartilharFoto(foto.dataUrl)));
        botoesDiv.appendChild(createSecureButton('bi-trash', 'Deletar', () => deletarFoto(foto.id)));
        div.appendChild(img);
        div.appendChild(botoesDiv);
        fragment.appendChild(div);
    });
    galeriaGrid.innerHTML = '';
    galeriaGrid.appendChild(fragment);
};
// Funções utilitárias seguras
const createEmptyGalleryHTML = () => `
    <div style="grid-column: 1 / -1; text-align: center; padding: 5rem 0; border: 1px dashed var(--border-color); border-radius: 1rem;">
        <i class="bi bi-image" style="font-size: 4rem; color: var(--text-dim);"></i>
        <h3 style="margin-top: 1rem; color: var(--text-main);">Nenhuma foto por aqui ainda</h3>
        <p style="color: var(--text-dim); margin-top: 0.5rem;">Capture momentos usando o botão principal.</p>
    </div>
`;
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
        link.download = `foto-studiovision-${Date.now()}.png`;
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
                title: 'Minha Foto do Studio Vision',
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
};
// Event listeners seguros
const setupSecureEventListeners = () => {
    btnCapturar?.addEventListener('click', (e) => {
        e.preventDefault();
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
        }
        catch (error) {
            console.error('Erro na captura:', error);
            showSecureNotification('Erro ao capturar foto.', 'error');
        }
    });
    btnAlternar?.addEventListener('click', (e) => {
        e.preventDefault();
        usandoCamFront = !usandoCamFront;
        iniciarCamera(usandoCamFront);
    });
    btnTema?.addEventListener('click', (e) => {
        e.preventDefault();
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
    [btnAbrirGaleriaDesktop, btnAbrirGaleriaPreview].forEach(btn => {
        btn?.addEventListener('click', (e) => {
            e.preventDefault();
            galleryModal?.showModal();
            renderizarGaleria();
        });
    });
    btnFecharModal?.addEventListener('click', (e) => {
        e.preventDefault();
        galleryModal?.close();
    });
};
// Inicialização segura
document.addEventListener('DOMContentLoaded', () => {
    try {
        iniciarCamera(usandoCamFront);
        renderizarListaFiltros();
        renderizarPreview();
        setupSecureEventListeners();
        console.log('Webcam Creative inicializado com segurança');
    }
    catch (error) {
        console.error('Erro na inicialização:', error);
        showSecureNotification('Erro na inicialização da aplicação.', 'error');
    }
});
