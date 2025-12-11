// Animações Simples - JavaScript Vanilla
'use strict';
// Utilitários de animação
const animate = (element, keyframes, options) => {
    if (!element)
        return;
    return element.animate(keyframes, {
        duration: 600,
        easing: 'ease-out',
        fill: 'forwards',
        ...options
    });
};
const staggerDelay = (elements, baseDelay = 0, increment = 100) => {
    elements.forEach((el, index) => {
        if (el instanceof HTMLElement) {
            el.style.animationDelay = `${baseDelay + (index * increment)}ms`;
        }
    });
};
// Animações de entrada da página
export const animatePageLoad = () => {
    const elements = {
        header: document.querySelector('.header'),
        webcamContainer: document.querySelector('.webcam-container'),
        sidePanel: document.querySelector('.side-panel'),
        controls: document.querySelector('.controls--desktop')
    };
    // Animação sequencial
    if (elements.header) {
        animate(elements.header, [
            { opacity: 0, transform: 'translateY(-20px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 500 });
    }
    if (elements.webcamContainer) {
        animate(elements.webcamContainer, [
            { opacity: 0, transform: 'scale(0.95)' },
            { opacity: 1, transform: 'scale(1)' }
        ], { duration: 600, delay: 200 });
    }
    if (elements.controls) {
        animate(elements.controls, [
            { opacity: 0, transform: 'translateY(20px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 400, delay: 400 });
    }
    if (elements.sidePanel) {
        animate(elements.sidePanel, [
            { opacity: 0, transform: 'translateX(30px)' },
            { opacity: 1, transform: 'translateX(0)' }
        ], { duration: 500, delay: 300 });
    }
};
// Animação do botão de captura
export const animateCaptureButton = () => {
    const button = document.querySelector('#btn-capturar');
    if (!button)
        return;
    animate(button, [
        { transform: 'scale(1) rotate(0deg)' },
        { transform: 'scale(1.1) rotate(5deg)' },
        { transform: 'scale(1.1) rotate(-5deg)' },
        { transform: 'scale(1) rotate(0deg)' }
    ], { duration: 400 });
};
// Animação de feedback de captura
export const animateCaptureSuccess = () => {
    const webcamContainer = document.querySelector('.webcam-container');
    if (!webcamContainer)
        return;
    // Adicionar classe CSS para animação
    webcamContainer.classList.add('capture-success');
    setTimeout(() => {
        webcamContainer.classList.remove('capture-success');
    }, 600);
};
// Animação de troca de filtro
export const animateFilterChange = () => {
    const video = document.querySelector('#webcam-video');
    if (!video)
        return;
    animate(video, [
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 0.7, transform: 'scale(1.02)' },
        { opacity: 1, transform: 'scale(1)' }
    ], { duration: 300 });
};
// Animação da galeria modal
export const animateGalleryOpen = () => {
    // As animações são controladas pelo CSS
    console.log('Modal aberto com animação CSS');
};
export const animateGalleryClose = () => {
    // Retorna promise resolvida imediatamente
    return Promise.resolve();
};
// Animação das imagens da galeria
export const animateGalleryImages = () => {
    const images = document.querySelectorAll('.img_galeria_content');
    images.forEach((img, index) => {
        animate(img, [
            { opacity: 0, transform: 'translateY(20px) scale(0.95)' },
            { opacity: 1, transform: 'translateY(0) scale(1)' }
        ], { duration: 400, delay: index * 50 });
    });
};
// Animação de hover nos botões
export const setupButtonHoverAnimations = () => {
    const buttons = document.querySelectorAll('.button-action, .btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            animate(button, [
                { transform: 'scale(1) translateY(0)' },
                { transform: 'scale(1.05) translateY(-2px)' }
            ], { duration: 200 });
        });
        button.addEventListener('mouseleave', () => {
            animate(button, [
                { transform: 'scale(1.05) translateY(-2px)' },
                { transform: 'scale(1) translateY(0)' }
            ], { duration: 200 });
        });
    });
};
// Animação de troca de tema
export const animateThemeChange = () => {
    const body = document.body;
    const themeIcon = document.querySelector('#theme-icon');
    animate(body, [
        { opacity: 1 },
        { opacity: 0.95 },
        { opacity: 1 }
    ], { duration: 300 });
    if (themeIcon) {
        animate(themeIcon, [
            { transform: 'rotate(0deg) scale(1)' },
            { transform: 'rotate(180deg) scale(1.2)' },
            { transform: 'rotate(180deg) scale(1)' }
        ], { duration: 500 });
    }
};
// Animação de alternância de câmera
export const animateCameraSwitch = () => {
    const video = document.querySelector('#webcam-video');
    const switchButton = document.querySelector('#btn-alternar');
    if (video) {
        animate(video, [
            { transform: 'rotateY(0deg)', opacity: 1 },
            { transform: 'rotateY(90deg)', opacity: 0.5 },
            { transform: 'rotateY(0deg)', opacity: 1 }
        ], { duration: 600 });
    }
    if (switchButton) {
        animate(switchButton, [
            { transform: 'rotate(0deg)' },
            { transform: 'rotate(360deg)' }
        ], { duration: 600 });
    }
};
// Animação de lista de filtros
export const animateFilterList = () => {
    const filterItems = document.querySelectorAll('.filter-item');
    filterItems.forEach((item, index) => {
        animate(item, [
            { opacity: 0, transform: 'translateX(-10px)' },
            { opacity: 1, transform: 'translateX(0)' }
        ], { duration: 300, delay: index * 30 });
    });
};
// Animação de preview da galeria
export const animateGalleryPreview = () => {
    const preview = document.querySelector('#gallery-preview img');
    if (preview) {
        animate(preview, [
            { opacity: 0, transform: 'scale(0.9) rotate(2deg)' },
            { opacity: 1, transform: 'scale(1) rotate(0deg)' }
        ], { duration: 500 });
    }
};
// Configurar modal
export const setupModal = () => {
    const modal = document.querySelector('#gallery-modal');
    const btnFechar = document.querySelector('#btn-fechar-modal');
    const btnAbrirDesktop = document.querySelector('#btn-abrir-galeria-desktop');
    const btnAbrirPreview = document.querySelector('#btn-abrir-galeria-preview');
    if (!modal)
        return;
    // Abrir modal
    const openModal = () => {
        modal.showModal();
        document.body.style.overflow = 'hidden';
    };
    // Fechar modal
    const closeModal = () => {
        modal.close();
        document.body.style.overflow = '';
    };
    // Event listeners
    btnAbrirDesktop?.addEventListener('click', openModal);
    btnAbrirPreview?.addEventListener('click', openModal);
    btnFechar?.addEventListener('click', closeModal);
    // Fechar ao clicar no backdrop
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    // Fechar com ESC
    modal.addEventListener('cancel', (e) => {
        e.preventDefault();
        closeModal();
    });
};
// Inicializar todas as animações
export const initializeAnimations = () => {
    requestAnimationFrame(() => {
        animatePageLoad();
        setupButtonHoverAnimations();
        setupModal();
    });
    console.log('Animações JavaScript Vanilla inicializadas');
};
