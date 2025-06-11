const video = document.querySelector('#vid') as HTMLVideoElement
const canvas = document.querySelector('#canv') as HTMLCanvasElement
const img_hedd = document.querySelector('#img_hedd') as HTMLImageElement
const filtro_atual_g = document.querySelector('#filtro_atual_g') as HTMLParagraphElement
const filtro_atual_mo = document.querySelector ('#filtro_atual_mo') as HTMLParagraphElement 
const galeria_modal = document.querySelector('#galeria_modal') as HTMLDivElement
const bt_ab_galeria = document.querySelector('#bt_ab_galeria') as HTMLButtonElement
const bt_fechar = document.querySelector('#bt_fechar') as  HTMLButtonElement
const galeria_img = document.querySelector('#galeria_img') as HTMLDivElement
const bt_ab_galeria_mb = document.querySelector('#bt_ab_galeria_mb') as  HTMLButtonElement
video.disablePictureInPicture = true

type Foto = {
  id: string
  dataUrl: string
}

bt_ab_galeria.addEventListener('click', ():void => {
  galeria_modal.style.display = 'block'
  rend_galeria()
})

bt_ab_galeria_mb.addEventListener('click', ():void => {
   galeria_modal.style.display = 'block'
   rend_galeria()
})

bt_fechar.addEventListener('click', ():void => {
  galeria_modal.style.display = 'none'
})

const salvar_foto = (dataUrl: string): void => {
  const fotos: Foto[] = JSON.parse(localStorage.getItem('fotos') || '[]')
  fotos.push({ id: Date.now().toString(), dataUrl })
  localStorage.setItem('fotos', JSON.stringify(fotos))
}

const rend_galeria = (): void => {
  const fotos: Foto[] = JSON.parse(localStorage.getItem('fotos') || '[]')
  galeria_img.innerHTML = ''

  fotos.forEach(foto => {
    const div = document.createElement('div')
    div.innerHTML = `
      <img src="${foto.dataUrl}" alt="Foto">
      <div class="botoes">
        <button onclick="baixarFoto('${foto.dataUrl}')">Baixar</button>
        <button onclick="compartilharFoto('${foto.dataUrl}')">Compartilhar</button>
        <button onclick="deletarFoto('${foto.id}')">Deletar</button>
      </div>
    `
    galeria_img.appendChild(div)
  })
}

(window as any).baixarFoto = (dataUrl: string) => {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = 'minha-foto.png'
  link.click()
}

(window as any).compartilharFoto = async (dataUrl: string) => {
  if (navigator.canShare && navigator.canShare({ files: [] })) {
    const blob = await (await fetch(dataUrl)).blob()
    const file = new File([blob], 'foto.png', { type: blob.type })
    try {
      await navigator.share({ files: [file], title: 'Minha Foto' })
    } catch (err) {
      alert('Não foi possível compartilhar')
    }
  } else {
    alert('Compartilhamento não suportado')
  }

  if (galeria_modal.style.display === 'block') {
  rend_galeria()
  }
}

(window as any).deletarFoto = (id: string) => {
  const fotos: Foto[] = JSON.parse(localStorage.getItem('fotos') || '[]')
  const atualizadas = fotos.filter(f => f.id !== id)
  localStorage.setItem('fotos', JSON.stringify(atualizadas))
  rend_galeria()
}



const alt = ():void => {
    const alter_modo = document.querySelector ('#alter_modo') as HTMLElement

    if (document.body.classList.contains('alt_modo')) {
          img_hedd.src = '/CSS/imagens/1-removebg-preview.png'
     }else{
          img_hedd.src = '/CSS/imagens/2-removebg-preview.png'
     }

    if (alter_modo.classList.contains("bi-moon-stars")) {
         alter_modo.classList.toggle("bi-sun-fill")
    }
}

const btn_foto = [
  document.querySelector('#it_foto'),
  document.querySelector('#it_foto_mb')
].filter(Boolean) as HTMLButtonElement[]

const btn_inverter = [
  document.querySelector('#it_inverter'),
  document.querySelector('#it_inverter_mb')
].filter(Boolean) as HTMLButtonElement[]

const btn_tema = [
  document.querySelector('#it_tema'),
  document.querySelector('#it_tema_mb')
].filter(Boolean) as HTMLButtonElement[]

const btn_filtro = [
  document.querySelector('#it_filtro'),
  document.querySelector('#it_filtro_mb')
].filter(Boolean) as HTMLButtonElement[]

const btn_share = [
  document.querySelector('#it_share'),
  document.querySelector('#it_share_mb')
].filter(Boolean) as HTMLButtonElement[]

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

let filtro_atual: number = 0
let stream_atual: MediaStream | null = null
let usando_cam_front: boolean = true

async function iniciarCamera(frontal = true): Promise<void> {
  if (stream_atual) {
    stream_atual.getTracks().forEach(track => track.stop())
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
    stream_atual = await navigator.mediaDevices.getUserMedia(constraints)
    video.srcObject = stream_atual
  } catch (error) {
    alert('Erro ao acessar a câmera! Verifique se sua câmera está sendo utilizada em outras aplicações.')
    console.error(error)
  }
}

btn_foto.forEach(btn => btn.addEventListener('click', (): void => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  ctx.filter = video.style.filter || 'none'
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  const dataUrl = canvas.toDataURL('image/png')
  salvar_foto(dataUrl)
}))

btn_tema.forEach(btn => btn.addEventListener('click', (): void => {
  document.body.classList.toggle('alt_modo')
  alt()
}))

btn_inverter.forEach(btn => btn.addEventListener('click', (): void => {
  usando_cam_front = !usando_cam_front
  iniciarCamera(usando_cam_front)
}))

btn_filtro.forEach(btn => btn.addEventListener('click', (): void => {
  filtro_atual = (filtro_atual + 1) % filtros.length
  const filtro = filtros[filtro_atual] 
  video.style.filter = filtro.valor 
  if (filtro_atual_g) {
    filtro_atual_g.textContent = `Filtro atual: ${filtro.nome}` 
  }
  if (filtro_atual_mo) {
    filtro_atual_mo.textContent = `Filtro atual: ${filtro.nome}`
  }
}))

btn_share.forEach(btn => btn.addEventListener('click', async () => {
  canvas.toBlob(async (blob) => {
    if (!blob) return

    const arquivo = new File([blob], 'foto.png', { type: 'image/png' })

    if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
      try {
        await navigator.share({
          files: [arquivo],
          title: 'Foto capturada',
          text: 'Veja essa foto que tirei!',
        })
      } catch (err) {
        console.error('Erro ao compartilhar:', err)
      }
    } else {
      alert('Compartilhamento não suportado neste navegador.')
    }
  }, 'image/png')
}))

iniciarCamera(usando_cam_front)

