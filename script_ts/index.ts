// ===================================================
// 1. SELECTORS E ELEMENTOS DO DOM
// ===================================================
// Elementos da Câmera e Canvas
const video = document.querySelector('#webcam-video') as HTMLVideoElement;
const canvas = document.querySelector('#webcam-canvas') as HTMLCanvasElement;

// Elementos de Status e Filtro
const filtroNomeDesktop = document.querySelector('#filtro-nome') as HTMLSpanElement;
const filtroNomeMobile = document.querySelector('.filter-status--mobile') as HTMLDivElement; // Usando a classe para status mobile, se implementada
const webcamOverlay = document.querySelector('.webcam-overlay') as HTMLDivElement;

// Botões de Ação
const btnCapturar = document.querySelector('#btn-capturar') as HTMLButtonElement;
const btnAlternar = document.querySelector('#btn-alternar') as HTMLButtonElement;
const btnTema = document.querySelector('#btn-modo-claro') as HTMLButtonElement;
const btnCompartilhar = document.querySelector('#btn-compartilhar') as HTMLButtonElement;
const btnGaleria = document.querySelector('#btn-galeria') as HTMLButtonElement;
const themeIcon = document.querySelector('#theme-icon') as HTMLElement;

// Galeria e Modal
const galleryModal = document.querySelector('#gallery-modal') as HTMLDialogElement;
const btnAbrirGaleria = document.querySelector('#btn-abrir-galeria') as HTMLButtonElement;
const btnFecharModal = document.querySelector('.modal .close') as HTMLButtonElement; // Se você usar a classe 'close'
const galeriaGrid = document.querySelector('.galeria-grid') as HTMLDivElement; // Nova classe para a grade da galeria

// Outros
const capturasCount = document.querySelector('#capturas-count') as HTMLParagraphElement;
video.disablePictureInPicture = true;


// ===================================================
// 2. TYPES E CONSTANTES
// ===================================================

type Foto = {
    id: string;
    dataUrl: string;
}

interface Filtro {
    nome: string;
    valor: string;
}

const filtros: Filtro[] = [
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
]

let filtroAtualIndex: number = 0;
let streamAtual: MediaStream | null = null;
let usandoCamFront: boolean = true;


// ===================================================
// 3. FUNÇÕES DA GALERIA (CRUD)
// ===================================================

const getFotos = (): Foto[] => {
    return JSON.parse(localStorage.getItem('fotos') || '[]');
}

const salvarFoto = (dataUrl: string): void => {
    const fotos = getFotos();
    fotos.push({ id: Date.now().toString(), dataUrl });
    localStorage.setItem('fotos', JSON.stringify(fotos));
    
    // Atualiza contadores
    if (capturasCount) {
        capturasCount.textContent = fotos.length.toString().padStart(2, '0');
    }
}

const renderizarGaleria = (): void => {
    const fotos = getFotos();
    
    // Verifica se o elemento existe no DOM antes de tentar limpar
    if (!galeriaGrid) return; 
    
    galeriaGrid.innerHTML = '';
    
    fotos.reverse().forEach(foto => { // Exibe a mais recente primeiro
        const div = document.createElement('div');
        div.setAttribute("class", "img_galeria_content");
        div.innerHTML = `
            <img src="${foto.dataUrl}" draggable="false" alt="Foto da Galeria">
            <div class="botoes">
                <button onclick="baixarFoto('${foto.dataUrl}')" title="Baixar">
                    <i class="bi bi-download"></i>
                </button>
                <button onclick="compartilharFotoGaleria('${foto.dataUrl}')" title="Compartilhar">
                    <i class="bi bi-share"></i>  
                </button>
                <button onclick="deletarFoto('${foto.id}')" title="Deletar">
                    <i class="bi bi-trash"></i>           
                </button>
            </div>
        `;
        galeriaGrid.appendChild(div);
    });
}

(window as any).baixarFoto = (dataUrl: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `foto-${Date.now()}.png`;
    link.click();
}

(window as any).deletarFoto = (id: string) => {
    const fotos = getFotos();
    const atualizadas = fotos.filter(f => f.id !== id);
    localStorage.setItem('fotos', JSON.stringify(atualizadas));
    
    // Atualiza contadores
    if (capturasCount) {
        capturasCount.textContent = atualizadas.length.toString().padStart(2, '0');
    }
    renderizarGaleria();
}

(window as any).compartilharFotoGaleria = async (dataUrl: string) => {
    if (navigator.canShare && navigator.canShare({ files: [] })) {
        try {
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], 'foto.png', { type: blob.type });
            await navigator.share({ 
                files: [file], 
                title: 'Minha Foto do Studio Vision', 
                text: 'Confira a foto que capturei!' 
            });
        } catch (err) {
             // O erro pode ser o usuário cancelando o compartilhamento
             console.error('Erro ou cancelamento no compartilhamento:', err);
             // alert('Não foi possível compartilhar a foto.');
        }
    } else {
        alert('Compartilhamento via Web Share API não suportado neste navegador.');
    }
}


// ===================================================
// 4. LÓGICA DE AÇÕES E CÂMERA
// ===================================================

async function iniciarCamera(frontal = true): Promise<void> {
    if (streamAtual) {
        streamAtual.getTracks().forEach(track => track.stop());
    }
    
    // Oculta o vídeo temporariamente para evitar flash
    video.style.display = 'none'; 
    webcamOverlay.style.display = 'flex'; // Exibe o overlay de "Carregando" ou "Sem Câmera"
    
    const constraints = {
        video: {
            facingMode: frontal ? 'user' : 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
        },
        audio: false
    }

    try {
        streamAtual = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = streamAtual;
        video.style.display = 'block'; // Exibe o vídeo
        webcamOverlay.style.display = 'none'; // Oculta o overlay
    } catch (error) {
        // Se houver erro, garante que o overlay seja exibido com a mensagem de erro
        webcamOverlay.style.display = 'flex'; 
        console.error("Erro ao iniciar a câmera:", error);
        // Não usamos alert em produção, mas mantendo para fins de debug
        // alert('Erro ao acessar a câmera! Verifique as permissões.');
    }
}

// Lógica de Captura
btnCapturar?.addEventListener('click', (): void => {
    if (!streamAtual) {
        alert("Nenhuma câmera ativa para capturar.");
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configura o canvas para o tamanho do vídeo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Aplica o filtro CSS do vídeo ao contexto do canvas
    ctx.filter = video.style.filter || 'none';
    
    // Desenha o frame atual do vídeo no canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/png');
    salvarFoto(dataUrl);
    // Atualiza a galeria caso o modal esteja aberto
    if (galleryModal.open) {
        renderizarGaleria();
    }
});


// Lógica de Alternar Câmera
btnAlternar?.addEventListener('click', (): void => {
    usandoCamFront = !usandoCamFront;
    iniciarCamera(usandoCamFront);
});


// Lógica de Troca de Filtro
const aplicarProximoFiltro = (): void => {
    filtroAtualIndex = (filtroAtualIndex + 1) % filtros.length;
    const filtro = filtros[filtroAtualIndex]; 
    
    if (video) {
        video.style.filter = filtro.valor; 
    }
    
    // Atualiza o texto de status
    if (filtroNomeDesktop) {
        filtroNomeDesktop.textContent = filtro.nome; 
    }
    if (filtroNomeMobile) {
        filtroNomeMobile.textContent = `Filtro atual: ${filtro.nome}`;
    }
}

btnTema?.addEventListener('click', (): void => {
    document.body.classList.toggle('theme--light');
    document.body.classList.toggle('theme--dark');
    
    // Atualiza o ícone do tema
    if (themeIcon) {
        const isDark = document.body.classList.contains('theme--dark');
        themeIcon.className = isDark ? 'bi bi-sun' : 'bi bi-moon-stars';
    }
});


// Lógica de Compartilhamento Direto da Webcam
btnCompartilhar?.addEventListener('click', async () => {
    // 1. Captura o frame atual para o canvas (com filtro)
    if (!streamAtual) {
        alert("Nenhuma imagem para compartilhar.");
        return;
    }
    
    btnCapturar?.click(); // Simula a captura para o canvas
    
    canvas.toBlob(async (blob) => {
        if (!blob) return

        const arquivo = new File([blob], 'foto-compartilhada.png', { type: 'image/png' })

        if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
            try {
                await navigator.share({
                    files: [arquivo],
                    title: 'Studio Vision Photo',
                    text: 'Capturei uma foto incrível!'
                });
            } catch (err) {
                 // Erro ou cancelamento pelo usuário
                 console.error('Erro ao compartilhar:', err);
            }
        } else {
            alert('Compartilhamento não suportado neste dispositivo.');
        }
    }, 'image/png');
});


// ===================================================
// 5. EVENT LISTENERS DO MODAL E INICIAÇÃO
// ===================================================

// Botões de Galeria
[btnGaleria, btnAbrirGaleria].forEach(botao => {
    botao?.addEventListener('click', () => {
        galleryModal?.showModal();
        renderizarGaleria(); // Renderiza sempre que o modal abre
    });
});

// Botão de Fechar Modal
btnFecharModal?.addEventListener('click', ():void => {
    galleryModal?.close();
});

// Evento de Iniciação
document.addEventListener('DOMContentLoaded', () => {
    iniciarCamera(usandoCamFront);
    aplicarProximoFiltro(); // Aplica o filtro 'Nenhum' ou o primeiro da lista
    
    // Atualiza o contador de capturas iniciais
    if (capturasCount) {
        capturasCount.textContent = getFotos().length.toString().padStart(2, '0');
    }
    
    // Associa a função de filtro ao botão (agora que ela está definida)
    const navBtnFiltro = document.querySelector('#nav-item-filtros');
    navBtnFiltro?.addEventListener('click', aplicarProximoFiltro);
});

// Associa a função de filtro aos botões de ação (se houver)
const btnFiltroAction = document.querySelector('#it_filtro'); // ID que estava no seu código original
if (btnFiltroAction) {
    btnFiltroAction.addEventListener('click', aplicarProximoFiltro);
}

// Associa a função de filtro ao botão do menu
const btnFiltroNav = document.querySelector('#nav-item-filtros');
if (btnFiltroNav) {
    btnFiltroNav.addEventListener('click', aplicarProximoFiltro);
}