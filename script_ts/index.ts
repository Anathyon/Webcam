const video = document.getElementById('vid') as HTMLVideoElement;
const canvas = document.getElementById('canv') as HTMLCanvasElement;
const btnFoto = document.getElementById('it_foto')!;
const btnInverter = document.getElementById('it_inverter')!;
const btnTema = document.getElementById('it_tema')!;
const btnFiltro = document.getElementById('it_filtro')!;
const btnShare = document.getElementById('it_share')!;

const filtros = ['none', 'grayscale(100%)', 'sepia(100%)', 'invert(100%)', 'contrast(150%)'];
let filtroAtual = 0;
let streamAtual: MediaStream | null = null;
let usandoCameraFrontal = true;

// Função para iniciar a câmera
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
  } catch (error) {
    alert('Erro ao acessar a câmera');
    console.error(error);
  }
}

// Capturar imagem
btnFoto.addEventListener('click', () => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.filter = video.style.filter || 'none';
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
});

// Alternar tema
btnTema.addEventListener('click', () => {
  document.body.classList.toggle('alt_modo');
});

// Inverter câmera
btnInverter.addEventListener('click', () => {
  usandoCameraFrontal = !usandoCameraFrontal;
  iniciarCamera(usandoCameraFrontal);
});

// Alternar filtro
btnFiltro.addEventListener('click', () => {
  filtroAtual = (filtroAtual + 1) % filtros.length;
  video.style.filter = filtros[filtroAtual];
});

// Compartilhar imagem
btnShare.addEventListener('click', async () => {
  canvas.toBlob(async (blob) => {
    if (!blob) return;

    const arquivo = new File([blob], 'foto.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
      try {
        await navigator.share({
          files: [arquivo],
          title: 'Foto capturada',
          text: 'Veja essa imagem que capturei!',
        });
      } catch (err) {
        console.error('Erro ao compartilhar:', err);
      }
    } else {
      alert('Compartilhamento não suportado neste navegador.');
    }
  }, 'image/png');
});

// Iniciar app
iniciarCamera(usandoCameraFrontal);
