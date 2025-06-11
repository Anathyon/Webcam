"use strict";
const video = document.querySelector('#vid');
const canvas = document.querySelector('#canv');
const img_hedd = document.querySelector('#img_hedd');
const filtro_atual_g = document.querySelector('#filtro_atual_g');
const filtro_atual_mo = document.querySelector('#filtro_atual_mo');
video.disablePictureInPicture = true;
const galeriaModal = document.getElementById('galeriaModal');
const abrirGaleria = document.getElementById('abrirGaleria');
const fecharGaleria = document.getElementById('fecharGaleria');
const containerGaleria = document.getElementById('containerGaleria');
abrirGaleria.addEventListener('click', () => {
    galeriaModal.style.display = 'block';
    renderGaleria();
});
fecharGaleria.addEventListener('click', () => {
    galeriaModal.style.display = 'none';
});
const salvarFoto = (dataUrl) => {
    const fotos = JSON.parse(localStorage.getItem('fotos') || '[]');
    fotos.push({ id: Date.now().toString(), dataUrl });
    localStorage.setItem('fotos', JSON.stringify(fotos));
};
const renderGaleria = () => {
    const fotos = JSON.parse(localStorage.getItem('fotos') || '[]');
    containerGaleria.innerHTML = '';
    fotos.forEach(foto => {
        const div = document.createElement('div');
        div.innerHTML = `
      <img src="${foto.dataUrl}" alt="Foto">
      <div class="botoes">
        <button onclick="baixarFoto('${foto.dataUrl}')">Baixar</button>
        <button onclick="compartilharFoto('${foto.dataUrl}')">Compartilhar</button>
        <button onclick="deletarFoto('${foto.id}')">Deletar</button>
      </div>
    `;
        containerGaleria.appendChild(div);
    });
};
window.baixarFoto = (dataUrl) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'minha-foto.png';
    link.click();
};
window.compartilharFoto = async (dataUrl) => {
    if (navigator.canShare && navigator.canShare({ files: [] })) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'foto.png', { type: blob.type });
        try {
            await navigator.share({ files: [file], title: 'Minha Foto' });
        }
        catch (err) {
            alert('Não foi possível compartilhar');
        }
    }
    else {
        alert('Compartilhamento não suportado');
    }
    if (galeriaModal.style.display === 'block') {
        renderGaleria();
    }
};
window.deletarFoto = (id) => {
    const fotos = JSON.parse(localStorage.getItem('fotos') || '[]');
    const atualizadas = fotos.filter(f => f.id !== id);
    localStorage.setItem('fotos', JSON.stringify(atualizadas));
    renderGaleria();
};
const alt = () => {
    const alter_modo = document.querySelector('#alter_modo');
    if (document.body.classList.contains('alt_modo')) {
        img_hedd.src = '/CSS/imagens/1-removebg-preview.png';
    }
    else {
        img_hedd.src = '/CSS/imagens/2-removebg-preview.png';
    }
    if (alter_modo.classList.contains("bi-moon-stars")) {
        alter_modo.classList.toggle("bi-sun-fill");
    }
};
const btn_foto = [
    document.querySelector('#it_foto'),
    document.querySelector('#it_foto_mb')
].filter(Boolean);
const btn_inverter = [
    document.querySelector('#it_inverter'),
    document.querySelector('#it_inverter_mb')
].filter(Boolean);
const btn_tema = [
    document.querySelector('#it_tema'),
    document.querySelector('#it_tema_mb')
].filter(Boolean);
const btn_filtro = [
    document.querySelector('#it_filtro'),
    document.querySelector('#it_filtro_mb')
].filter(Boolean);
const btn_share = [
    document.querySelector('#it_share'),
    document.querySelector('#it_share_mb')
].filter(Boolean);
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
let filtro_atual = 0;
let stream_atual = null;
let usando_cam_front = true;
async function iniciarCamera(frontal = true) {
    if (stream_atual) {
        stream_atual.getTracks().forEach(track => track.stop());
    }
    const constraints = {
        video: {
            facingMode: frontal ? 'user' : 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
        },
        audio: false
    };
    try {
        stream_atual = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream_atual;
    }
    catch (error) {
        alert('Erro ao acessar a câmera! Verifique se sua câmera está sendo utilizada em outras aplicações.');
        console.error(error);
    }
}
btn_foto.forEach(btn => btn.addEventListener('click', () => {
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.filter = video.style.filter || 'none';
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    salvarFoto(dataUrl);
}));
btn_tema.forEach(btn => btn.addEventListener('click', () => {
    document.body.classList.toggle('alt_modo');
    alt();
}));
btn_inverter.forEach(btn => btn.addEventListener('click', () => {
    usando_cam_front = !usando_cam_front;
    iniciarCamera(usando_cam_front);
}));
btn_filtro.forEach(btn => btn.addEventListener('click', () => {
    filtro_atual = (filtro_atual + 1) % filtros.length;
    const filtro = filtros[filtro_atual];
    video.style.filter = filtro.valor;
    if (filtro_atual_g) {
        filtro_atual_g.textContent = `Filtro atual: ${filtro.nome}`;
    }
    if (filtro_atual_mo) {
        filtro_atual_mo.textContent = `Filtro atual: ${filtro.nome}`;
    }
}));
btn_share.forEach(btn => btn.addEventListener('click', async () => {
    canvas.toBlob(async (blob) => {
        if (!blob)
            return;
        const arquivo = new File([blob], 'foto.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
            try {
                await navigator.share({
                    files: [arquivo],
                    title: 'Foto capturada',
                    text: 'Veja essa foto que tirei!',
                });
            }
            catch (err) {
                console.error('Erro ao compartilhar:', err);
            }
        }
        else {
            alert('Compartilhamento não suportado neste navegador.');
        }
    }, 'image/png');
}));
iniciarCamera(usando_cam_front);
