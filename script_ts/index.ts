const video = document.querySelector('#vid') as HTMLVideoElement
const canvas = document.querySelector('#canv') as HTMLCanvasElement
const btnFoto = document.querySelector('#it_foto') as HTMLButtonElement
const btnInverter = document.querySelector('#it_inverter') as HTMLButtonElement
const btnTema = document.querySelector('#it_tema') as HTMLButtonElement
const btnFiltro = document.querySelector('#it_filtro') as HTMLButtonElement
const btnShare = document.querySelector('#it_share') as HTMLButtonElement

const filtros = ['none', 'grayscale(100%)', 'sepia(100%)', 'invert(100%)', 'contrast(150%)']
let filtroAtual:number = 0
let streamAtual: MediaStream | null = null
let usandoCameraFrontal:boolean = true

async function iniciarCamera (frontal = true):Promise<void> {
  
    if (streamAtual) {
    streamAtual.getTracks().forEach(track => track.stop())
  }

  const constraints = {
    video: {
      facingMode: frontal ? 'user' : 'environment',
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
    audio: false
  }

  try {
    streamAtual = await navigator.mediaDevices.getUserMedia(constraints)
    video.srcObject = streamAtual
  } catch (error) {
    alert('Erro ao acessar a câmera')
    console.error(error)
  }
}

btnFoto.addEventListener('click', ():void => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  ctx.filter = video.style.filter || 'none'
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
})

btnTema.addEventListener('click', ():void => {
  document.body.classList.toggle('alt_modo')
})

btnInverter.addEventListener('click', ():void => {
  usandoCameraFrontal = !usandoCameraFrontal
  iniciarCamera(usandoCameraFrontal)
})

btnFiltro.addEventListener('click', ():void => {
  filtroAtual = (filtroAtual + 1) % filtros.length;
  video.style.filter = filtros[filtroAtual];
})

btnShare.addEventListener('click', async () => {
  canvas.toBlob(async (blob) => {
    if (!blob) return

    const arquivo = new File([blob], 'foto.png', { type: 'image/png' })

    if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
      try {
        await navigator.share({
          files: [arquivo],
          title: 'Foto capturada',
          text: 'Veja essa imagem que capturei!',
        })
      } catch (err) {
        console.error('Erro ao compartilhar:', err)
      }
    } else {
      alert('Compartilhamento não suportado neste navegador.')
    }
  }, 'image/png')
})

iniciarCamera(usandoCameraFrontal)
