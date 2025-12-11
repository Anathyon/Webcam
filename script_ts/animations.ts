// Animações com Framer Motion para Webcam Creative
import { animate, stagger } from 'framer-motion';

// Função timeline personalizada
const timeline = (animations: Array<[Element | null, any, any?]>): void => {
    animations.forEach(([element, keyframes, options], index) => {
        if (element) {
            const delay = (options?.at || 0) + (index * 0.1);
            animate(element, keyframes, { ...options, delay });
        }
    });
};

// Configurações de animação
const ANIMATION_CONFIG = {
    duration: 0.6,
    ease: [0.25, 0.46, 0.45, 0.94],
    stagger: 0.1
} as const;

// Animações de entrada da página
export const animatePageLoad = (): void => {
    const elements = {
        header: document.querySelector('.header'),
        webcamContainer: document.querySelector('.webcam-container'),
        sidePanel: document.querySelector('.side-panel'),
        controls: document.querySelector('.controls--desktop')
    };

    // Animação sequencial de entrada
    timeline([
        [elements.header, { opacity: [0, 1], y: [-20, 0] }, { duration: 0.5 }],
        [elements.webcamContainer, { opacity: [0, 1], scale: [0.95, 1] }, { duration: 0.6, at: 0.2 }],
        [elements.controls, { opacity: [0, 1], y: [20, 0] }, { duration: 0.4, at: 0.4 }],
        [elements.sidePanel, { opacity: [0, 1], x: [30, 0] }, { duration: 0.5, at: 0.3 }]
    ]);
};

// Animação do botão de captura
export const animateCaptureButton = (): void => {
    const button = document.querySelector('#btn-capturar');
    if (!button) return;

    animate(button, {
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0]
    }, {
        duration: 0.4,
        ease: "easeInOut"
    });
};

// Animação de feedback de captura
export const animateCaptureSuccess = (): void => {
    const webcamContainer = document.querySelector('.webcam-container');
    if (!webcamContainer) return;

    // Flash effect
    animate(webcamContainer, {
        boxShadow: [
            '0 0 0 0 rgba(34, 197, 94, 0)',
            '0 0 0 8px rgba(34, 197, 94, 0.4)',
            '0 0 0 0 rgba(34, 197, 94, 0)'
        ]
    }, { duration: 0.6 });
};

// Animação de troca de filtro
export const animateFilterChange = (): void => {
    const video = document.querySelector('#webcam-video');
    if (!video) return;

    animate(video, {
        opacity: [1, 0.7, 1],
        scale: [1, 1.02, 1]
    }, { duration: 0.3 });
};

// Animação da galeria modal
export const animateGalleryOpen = (): void => {
    const modal = document.querySelector('#gallery-modal');
    const modalContent = document.querySelector('.modal-content');
    
    if (!modal || !modalContent) return;

    animate(modal, {
        opacity: [0, 1],
        backdropFilter: ['blur(0px)', 'blur(8px)']
    }, { duration: 0.3 });

    animate(modalContent, {
        opacity: [0, 1],
        scale: [0.9, 1],
        y: [20, 0]
    }, { duration: 0.4, delay: 0.1 });
};

// Animação das imagens da galeria
export const animateGalleryImages = (): void => {
    const images = document.querySelectorAll('.img_galeria_content');
    
    animate(images, {
        opacity: [0, 1],
        y: [20, 0],
        scale: [0.95, 1]
    }, {
        duration: 0.4,
        delay: stagger(0.05)
    });
};

// Animação de hover nos botões
export const setupButtonHoverAnimations = (): void => {
    const buttons = document.querySelectorAll('.button-action, .btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            animate(button, {
                scale: 1.05,
                y: -2
            }, { duration: 0.2 });
        });

        button.addEventListener('mouseleave', () => {
            animate(button, {
                scale: 1,
                y: 0
            }, { duration: 0.2 });
        });
    });
};

// Animação de troca de tema
export const animateThemeChange = (): void => {
    const body = document.body;
    const themeIcon = document.querySelector('#theme-icon');
    
    animate(body, {
        opacity: [1, 0.95, 1]
    }, { duration: 0.3 });

    if (themeIcon) {
        animate(themeIcon, {
            rotate: [0, 180],
            scale: [1, 1.2, 1]
        }, { duration: 0.5 });
    }
};

// Animação de alternância de câmera
export const animateCameraSwitch = (): void => {
    const video = document.querySelector('#webcam-video');
    const switchButton = document.querySelector('#btn-alternar');
    
    if (video) {
        animate(video, {
            rotateY: [0, 90, 0],
            opacity: [1, 0.5, 1]
        }, { duration: 0.6 });
    }

    if (switchButton) {
        animate(switchButton, {
            rotate: [0, 360]
        }, { duration: 0.6 });
    }
};

// Animação de lista de filtros
export const animateFilterList = (): void => {
    const filterItems = document.querySelectorAll('.filter-item');
    
    animate(filterItems, {
        opacity: [0, 1],
        x: [-10, 0]
    }, {
        duration: 0.3,
        delay: stagger(0.03)
    });
};

// Animação de preview da galeria
export const animateGalleryPreview = (): void => {
    const preview = document.querySelector('#gallery-preview img');
    
    if (preview) {
        animate(preview, {
            opacity: [0, 1],
            scale: [0.9, 1],
            rotate: [2, 0]
        }, { duration: 0.5 });
    }
};

// Animação de notificação (para feedback visual)
export const animateNotification = (element: HTMLElement, type: 'success' | 'error' = 'success'): void => {
    const color = type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)';
    
    animate(element, {
        backgroundColor: ['transparent', color, 'transparent'],
        scale: [1, 1.02, 1]
    }, { duration: 0.8 });
};

// Animação de loading/carregamento
export const animateLoading = (element: HTMLElement): void => {
    animate(element, {
        opacity: [0.5, 1, 0.5]
    }, {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
    });
};

// Inicializar todas as animações
export const initializeAnimations = (): void => {
    // Animação inicial da página
    animatePageLoad();
    
    // Setup de hover animations
    setupButtonHoverAnimations();
    
    console.log('Animações Framer Motion inicializadas');
};