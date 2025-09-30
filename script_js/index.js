"use strict";
// ===================================================
// 1. SELECTORS E ELEMENTOS DO DOM
// ===================================================
// Elementos da Câmera e Canvas
const video = document.querySelector('#webcam-video');
const canvas = document.querySelector('#webcam-canvas');
const webcamOverlay = document.querySelector('#webcam-overlay');
video.disablePictureInPicture = true;
// Elementos de Status e Filtro
const filtroNomeDesktop = document.querySelector('#filtro-nome');
const filtroStatusOverlay = document.querySelector('#filtro-status-overlay');
const filterListUl = document.querySelector('#filter-list');
const filterCountSpan = document.querySelector('#filter-count');
// Botões de Ação
const btnCapturar = document.querySelector('#btn-capturar');
const btnAlternar = document.querySelector('#btn-alternar');
const btnTema = document.querySelector('#btn-modo-claro');
const btnCompartilhar = document.querySelector('#btn-compartilhar');
const themeIcon = document.querySelector('#theme-icon');
const headerLogo = document.querySelector('#header-logo');
// Galeria e Modal
const galleryModal = document.querySelector('#gallery-modal');
const btnAbrirGaleriaDesktop = document.querySelector('#btn-abrir-galeria-desktop');
const btnAbrirGaleriaPreview = document.querySelector('#btn-abrir-galeria-preview');
const btnFecharModal = document.querySelector('#btn-fechar-modal');
const galeriaGrid = document.querySelector('#galeria-grid');
const galleryPreview = document.querySelector('#gallery-preview');
// Painel Rápido
const capturasCount = document.querySelector('#capturas-count');
const lastPhotoTime = document.querySelector('#last-photo-time');
const filtros = [
    { nome: 'Nenhum', valor: 'none' },
    { nome: 'Opacidade 50% + Contraste 150%', valor: 'opacity(50%) contrast(150%)' },
    { nome: 'Tons de Cinza', valor: 'grayscale(100%)' },
    { nome: 'Sépia', valor: 'sepia(100%)' },
    { nome: 'Inverter Cores', valor: 'invert(100%)' },
    { nome: 'Contraste 150%', valor: 'contrast(150%)' },
    { nome: 'Brilho 150%', valor: 'brightness(150%)' },
    { nome: 'Desfoque 5px', valor: 'blur(5px)' },
    { nome: 'Girar Matiz 90°', valor: 'hue-rotate(90deg)' },
    { nome: 'Girar Matiz 180°', valor: 'hue-rotate(180deg)' },
    { nome: 'Saturação 200%', valor: 'saturate(200%)' },
    { nome: 'Opacidade 50%', valor: 'opacity(50%)' },
    { nome: 'Sombra Projetada', valor: 'drop-shadow(5px 5px 5px black)' },
    { nome: 'Meio Cinza + Sépia', valor: 'grayscale(50%) sepia(60%)' },
    { nome: 'Contraste Alto + Brilho Reduzido', valor: 'contrast(200%) brightness(80%)' },
    { nome: 'Inversão + Matiz 270°', valor: 'invert(100%) hue-rotate(270deg)' },
    { nome: 'Desfoque 3px + Brilho 120%', valor: 'blur(3px) brightness(120%)' }
];
let filtroAtualIndex = 0;
let streamAtual = null;
let usandoCamFront = true;
// ===================================================
// 3. FUNÇÕES DE CÂMERA E FILTRO
// ===================================================
/** Inicia ou troca a câmera, solicitando permissão se necessário. */
async function iniciarCamera(frontal = true) {
    if (streamAtual) {
        streamAtual.getTracks().forEach(track => track.stop());
    }
    video.style.display = 'none';
    webcamOverlay.style.display = 'flex';
    // Atualiza o status de filtro no overlay, pois o filtro inicial é 'Nenhum'
    aplicarFiltro(filtroAtualIndex, false);
    const constraints = {
        video: {
            facingMode: frontal ? 'user' : 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
        },
        audio: false
    };
    try {
        streamAtual = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = streamAtual;
        video.style.display = 'block';
        webcamOverlay.style.display = 'none';
    }
    catch (error) {
        webcamOverlay.style.display = 'flex';
        console.error("Erro ao iniciar a câmera:", error);
    }
}
/** Aplica um filtro CSS à webcam e atualiza os textos de status. */
const aplicarFiltro = (index, updateGlobalIndex = true) => {
    const filtro = filtros[index];
    if (updateGlobalIndex) {
        filtroAtualIndex = index;
    }
    if (video) {
        video.style.filter = filtro.valor;
    }
    // Atualiza o texto de status
    if (filtroNomeDesktop) {
        filtroNomeDesktop.textContent = filtro.nome;
    }
    if (filtroStatusOverlay) {
        filtroStatusOverlay.textContent = `FILTRO: ${filtro.nome.toUpperCase()}`;
    }
    renderizarListaFiltros();
};
// ===================================================
// 4. LÓGICA DA GALERIA (CRUD, RENDER, PRÉVIA)
// ===================================================
const getFotos = () => {
    return JSON.parse(localStorage.getItem('fotos') || '[]');
};
/** Renderiza a última foto na prévia da galeria (sidebar) */
const renderizarPreview = () => {
    const fotos = getFotos();
    if (!galleryPreview)
        return;
    if (fotos.length === 0) {
        galleryPreview.innerHTML = `
            <i class="bi bi-image"></i>
            <p>Nenhuma foto por aqui ainda</p>
            <p class="gallery-preview__hint">Capture momentos usando o botão principal para começar a preencher sua galeria.</p>
        `;
        lastPhotoTime.textContent = '—';
    }
    else {
        const ultimaFoto = fotos[fotos.length - 1];
        const dataFoto = new Date(ultimaFoto.timestamp);
        const horaMinuto = dataFoto.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        galleryPreview.innerHTML = `
            <img src="${ultimaFoto.dataUrl}" alt="Última foto" style="width: 100%; height: 100%; object-fit: cover; border-radius: 1rem;">
        `;
        lastPhotoTime.textContent = horaMinuto;
    }
    capturasCount.textContent = fotos.length.toString().padStart(2, '0');
};
const salvarFoto = (dataUrl) => {
    const fotos = getFotos();
    const novaFoto = { id: Date.now().toString(), dataUrl, timestamp: Date.now() };
    fotos.push(novaFoto);
    localStorage.setItem('fotos', JSON.stringify(fotos));
    renderizarPreview(); // Atualiza a prévia imediatamente
};
/** Renderiza o modal da galeria com todas as fotos. */
const renderizarGaleria = () => {
    const fotos = getFotos().reverse(); // Exibe a mais recente primeiro
    if (!galeriaGrid)
        return;
    if (fotos.length === 0) {
        // Estilo de "Nenhuma foto" no modal, como na imagem 213253.png
        galeriaGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 5rem 0; border: 1px dashed var(--border-color); border-radius: 1rem;">
                <i class="bi bi-image" style="font-size: 4rem; color: var(--text-dim);"></i>
                <h3 style="margin-top: 1rem; color: var(--text-main);">Nenhuma foto por aqui ainda</h3>
                <p style="color: var(--text-dim); margin-top: 0.5rem;">Capture momentos usando o botão principal para começar a preencher sua galeria.</p>
            </div>
        `;
        return;
    }
    galeriaGrid.innerHTML = '';
    fotos.forEach(foto => {
        const div = document.createElement('div');
        div.setAttribute("class", "img_galeria_content");
        div.innerHTML = `
            <img src="${foto.dataUrl}" draggable="false" alt="Foto da Galeria">
            <div class="botoes">
                <button onclick="window.baixarFoto('${foto.dataUrl}')" title="Baixar">
                    <i class="bi bi-download"></i>
                </button>
                <button onclick="window.compartilharFotoGaleria('${foto.dataUrl}')" title="Compartilhar">
                    <i class="bi bi-share"></i>  
                </button>
                <button onclick="window.deletarFoto('${foto.id}')" title="Deletar">
                    <i class="bi bi-trash"></i>           
                </button>
            </div>
        `;
        galeriaGrid.appendChild(div);
    });
};
// Tornando as funções acessíveis globalmente para os botões 'onclick'
window.baixarFoto = (dataUrl) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `foto-studiovision-${Date.now()}.png`;
    link.click();
};
window.deletarFoto = (id) => {
    const fotos = getFotos();
    const atualizadas = fotos.filter(f => f.id !== id);
    localStorage.setItem('fotos', JSON.stringify(atualizadas));
    renderizarPreview(); // Atualiza contadores e prévia
    renderizarGaleria(); // Atualiza a galeria se o modal estiver aberto
};
window.compartilharFotoGaleria = async (dataUrl) => {
    try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'foto.png', { type: blob.type });
        // CORREÇÃO: Verifica se é possível compartilhar o tipo de arquivo
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Minha Foto do Studio Vision',
                text: 'Confira a foto que capturei!'
            });
        }
        else {
            alert('Compartilhamento de arquivos não suportado neste dispositivo.');
        }
    }
    catch (err) {
        // Erro ou cancelamento no compartilhamento
        console.error('Erro no compartilhamento:', err);
    }
};
// ===================================================
// 5. EXPLORADOR DE FILTROS DINÂMICO
// ===================================================
/** Gera a lista de filtros na sidebar. */
const renderizarListaFiltros = () => {
    if (!filterListUl)
        return;
    filterListUl.innerHTML = '';
    filterCountSpan.textContent = `${filtroAtualIndex + 1}/${filtros.length}`;
    filtros.forEach((filtro, index) => {
        const li = document.createElement('li');
        li.classList.add('filter-item');
        if (index === filtroAtualIndex) {
            li.classList.add('filter-item--active');
        }
        li.setAttribute('data-index', index.toString());
        li.innerHTML = `
            <span class="filter-item__name">${filtro.nome}</span>
            ${index === filtroAtualIndex
            ? '<span class="filter-item__status">ATUAL</span>'
            : '<button class="btn btn--apply">APLICAR</button>'}
        `;
        li.addEventListener('click', (e) => {
            // Se o clique for no botão 'APLICAR' ou no item
            if (e.target instanceof HTMLButtonElement || e.target === li) {
                aplicarFiltro(index);
            }
        });
        filterListUl.appendChild(li);
    });
};
// ===================================================
// 6. EVENT LISTENERS
// ===================================================
// Captura de Foto
btnCapturar?.addEventListener('click', () => {
    if (!streamAtual) {
        alert("Câmera não ativa.");
        return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.filter = video.style.filter || 'none';
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    salvarFoto(dataUrl);
});
// Alternar Câmera
btnAlternar?.addEventListener('click', () => {
    usandoCamFront = !usandoCamFront;
    iniciarCamera(usandoCamFront);
});
// Alternar Tema
btnTema?.addEventListener('click', () => {
    const body = document.body;
    const isDark = body.classList.contains('theme--dark');
    body.classList.toggle('theme--dark', !isDark);
    body.classList.toggle('theme--light', isDark);
    if (themeIcon) {
        themeIcon.className = isDark ? 'bi bi-moon-stars' : 'bi bi-sun';
    }
    if (headerLogo) {
        if (body.classList.contains('theme--light')) {
            headerLogo.src = '/CSS/img/logo-light.png';
        }
        else {
            headerLogo.src = '/CSS/img/logo-dark.png';
        }
    }
});
// Abrir Modal da Galeria
[btnAbrirGaleriaDesktop, btnAbrirGaleriaPreview].forEach(btn => {
    btn?.addEventListener('click', () => {
        galleryModal?.showModal();
        renderizarGaleria();
    });
});
// Fechar Modal da Galeria
btnFecharModal?.addEventListener('click', () => {
    galleryModal?.close();
});
// ===================================================
// 7. INICIALIZAÇÃO
// ===================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicia a câmera (e aplica o filtro 'Nenhum' por padrão)
    iniciarCamera(usandoCamFront);
    // 2. Renderiza a lista de filtros
    renderizarListaFiltros();
    // 3. Renderiza a prévia da galeria e contadores
    renderizarPreview();
});
