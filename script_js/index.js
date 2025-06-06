"use strict";
const video = document.querySelector('#vid');
const canvas = document.querySelector('#canv');
const btnFoto = [
    document.querySelector('#it_foto'),
    document.querySelector('#it_foto_mb')
].filter(Boolean);
const btnInverter = [
    document.querySelector('#it_inverter'),
    document.querySelector('#it_inverter_mb')
].filter(Boolean);
const btnTema = [
    document.querySelector('#it_tema'),
    document.querySelector('#it_tema_mb')
].filter(Boolean);
const btnFiltro = [
    document.querySelector('#it_filtro'),
    document.querySelector('#it_filtro_mb')
].filter(Boolean);
const btnShare = [
    document.querySelector('#it_share'),
    document.querySelector('#it_share_mb')
].filter(Boolean);
const filtros = [
    'none',
    'opacity(50%)contrast(150%)',
    'grayscale(100%)',
    'sepia(100%)',
    'invert(100%)',
    'contrast(150%)',
    'brightness(150%)',
    'blur(5px)',
    'hue-rotate(90deg)',
    'hue-rotate(180deg)',
    'saturate(200%)',
    'opacity(50%)',
    'drop-shadow(5px 5px 5px black)',
    'grayscale(50%) sepia(60%)',
    'contrast(200%) brightness(80%)',
    'invert(100%) hue-rotate(270deg)',
    'blur(3px) brightness(120%)'
];
let filtroAtual = 0;
let streamAtual = null;
let usandoCameraFrontal = true;
async function iniciarCamera(frontal = true) {
    if (streamAtual) {
        streamAtual.getTracks().forEach(track => track.stop());
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
        streamAtual = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = streamAtual;
    }
    catch (error) {
        alert('Erro ao acessar a câmera');
        console.error(error);
    }
}
btnFoto.forEach(btn => btn.addEventListener('click', () => {
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.filter = video.style.filter || 'none';
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
}));
btnTema.forEach(btn => btn.addEventListener('click', () => {
    document.body.classList.toggle('alt_modo');
}));
btnInverter.forEach(btn => btn.addEventListener('click', () => {
    usandoCameraFrontal = !usandoCameraFrontal;
    iniciarCamera(usandoCameraFrontal);
}));
btnFiltro.forEach(btn => btn.addEventListener('click', () => {
    filtroAtual = (filtroAtual + 1) % filtros.length;
    video.style.filter = filtros[filtroAtual];
}));
btnShare.forEach(btn => btn.addEventListener('click', async () => {
    canvas.toBlob(async (blob) => {
        if (!blob)
            return;
        const arquivo = new File([blob], 'foto.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
            try {
                await navigator.share({
                    files: [arquivo],
                    title: 'Foto capturada',
                    text: 'Veja essa imagem que capturei!',
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
iniciarCamera(usandoCameraFrontal);
