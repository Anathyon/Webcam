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
async function obter_cam() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return alert("Seu navegador não tem suorte para mídia");
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
        alert("Não foi possível acessar a câmera. Verifique as permissões do seu navegador.");
    }
}
document.addEventListener("DOMContentLoaded", obter_cam);
function func_t_ft() {
    canvas.height = t_video.videoHeight;
    canvas.width = t_video.videoWidth;
    const context = canvas.getContext("2d");
    if (context) {
        context.drawImage(t_video, 0, 0, canvas.width, canvas.height);
    }
}
tirar_foto.addEventListener("click", func_t_ft);
tirar_foto.addEventListener("touchstart", func_t_ft);
function func_remv_ft() {
    const clear = canvas.getContext("2d");
    if (clear) {
        clear.clearRect(0, 0, canvas.width, canvas.height);
    }
}
rmv_ft.addEventListener("click", func_remv_ft);
tirar_foto.addEventListener("touchstart", func_remv_ft);
function func_rende_ft() {
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
            alert("Você não tirou nenhuma foto");
            console.error("Você não tirou nenhuma foto");
        }
        else {
            const download = document.createElement("a");
            download.href = canvas.toDataURL();
            download.download = "suafoto.png";
            download.click();
        }
    }
}
bx_ft.addEventListener("click", func_rende_ft);
tirar_foto.addEventListener("touchstart", func_rende_ft);
function func_alt_modo() {
    alt_modo.classList.toggle("alt_modo");
    const modoescuro = body.classList.contains("alt_modo");
    if (modoescuro) {
        img_hedd.src = "./imagens/1-removebg-preview.png";
        it_foto.src = "./svg/camera.svg";
        lx_foto.src = "./svg/trash.svg";
        down_ft.src = "./svg/download.svg";
        alterador.src = "./svg/sun-svgrepo-com.svg";
    }
    else {
        img_hedd.src = "./imagens/2-removebg-preview.png";
        it_foto.src = "./svg/cam-svgrepo-com.svg";
        lx_foto.src = "./svg/trash-svgrepo-com.svg";
        down_ft.src = "./svg/download-cloud-svgrepo-com.svg";
        alterador.src = "./svg/moon-stars-svgrepo-com.svg";
    }
}
modo_luz_escuridao.addEventListener("click", func_alt_modo);
modo_luz_escuridao.addEventListener("touchstart", func_alt_modo);
vid.disablePictureInPicture = true;
