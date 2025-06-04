"use strict";
const t_video = document.querySelector("video");
const canvas = document.querySelector("canvas");
const tirar_foto = document.querySelector("#bt_tirar_foto");
const rmv_ft = document.querySelector("#rmv_ft");
const bx_ft = document.querySelector("#bx_ft");
const vid = document.querySelector("#vid");
const modo_luz_escuridao = document.querySelector("#modo_luz_escuridao");
const alt_modo = document.querySelector(".alt_modo");
const img_hedd = document.querySelector("#img_hedd");
const it_foto = document.querySelector("#it_foto");
const lx_foto = document.querySelector("#lx_foto");
const down_ft = document.querySelector("#down_ft");
const body = document.querySelector("body");
const alterador = document.querySelector("#alterador");
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
if (isTouchDevice) {
    document.body.classList.add("modo_touch");
}
document.body.addEventListener("touchstart", (e) => {
    if (e.target instanceof HTMLButtonElement) {
        e.preventDefault();
    }
}, { passive: false });
async function obter_cam() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return alert("Seu navegador não tem suporte para mídia.");
    }
    try {
        const midia = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false
        });
        t_video.srcObject = midia;
        await t_video.play();
    }
    catch (error) {
        console.error("ACESSO NEGADO", error);
        alert("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
    }
}
document.addEventListener("DOMContentLoaded", obter_cam);
const func_t_ft = () => {
    canvas.height = t_video.videoHeight;
    canvas.width = t_video.videoWidth;
    const context = canvas.getContext("2d");
    if (context) {
        requestAnimationFrame(() => {
            context.drawImage(t_video, 0, 0, canvas.width, canvas.height);
        });
        if ("vibrate" in navigator) {
            navigator.vibrate(100);
        }
        body.classList.add("flash");
        setTimeout(() => body.classList.remove("flash"), 150);
    }
};
const func_remv_ft = () => {
    const clear = canvas.getContext("2d");
    if (clear) {
        clear.clearRect(0, 0, canvas.width, canvas.height);
    }
};
const func_rende_ft = () => {
    const context = canvas.getContext("2d");
    if (context) {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let isCanvasEmpty = true;
        for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] !== 0) {
                isCanvasEmpty = false;
                break;
            }
        }
        if (isCanvasEmpty) {
            alert("Você não tirou nenhuma foto.");
            console.error("Você não tirou nenhuma foto.");
        }
        else {
            const download = document.createElement("a");
            download.href = canvas.toDataURL();
            download.download = `foto_${Date.now()}.png`;
            download.click();
        }
    }
};
const func_alt_modo = () => {
    alt_modo.classList.toggle("alt_modo");
    const modoescuro = body.classList.contains("alt_modo");
    if (modoescuro) {
        img_hedd.src = "./CSS/imagens/1-removebg-preview.png";
        it_foto.src = "./CSS/svg/camera.svg";
        lx_foto.src = "./CSS/svg/trash.svg";
        down_ft.src = "./CSS/svg/download.svg";
        alterador.src = "./CSS/svg/sun-svgrepo-com.svg";
    }
    else {
        img_hedd.src = "./CSS/imagens/2-removebg-preview.png";
        it_foto.src = "./CSS/svg/cam-svgrepo-com.svg";
        lx_foto.src = "./CSS/svg/trash-svgrepo-com.svg";
        down_ft.src = "./CSS/svg/download-cloud-svgrepo-com.svg";
        alterador.src = "./CSS/svg/moon-stars-svgrepo-com.svg";
    }
};
tirar_foto.addEventListener("pointerdown", func_t_ft);
rmv_ft.addEventListener("pointerdown", func_remv_ft);
bx_ft.addEventListener("pointerdown", func_rende_ft);
modo_luz_escuridao.addEventListener("pointerdown", func_alt_modo);
vid.disablePictureInPicture = true;
