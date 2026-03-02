import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fetchMemories } from "../services/api";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 480;
const SCROLL_HEIGHT_PX = TOTAL_FRAMES * 12;

const frameSources = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
    // Cambiamos padStart a 4 porque FFmpeg hizo 0001, 0002...
    const num = (i + 1).toString().padStart(4, '0');
    // Actualizamos el nombre al que le pusiste en la terminal y a .jpg
    return `/Home3D/fotograma_${num}.jpg`;
});

const staticGalleryImages = [
    "/Slider1.jpg",
    "/Slider2.jpg",
    "/Slider3.jpg",
    "/Slider4.jpg",
    "/Slider5.jpg"
];

const KEYFRAMES = {
    KISS_START: 0,
    KISS_PEAK: Math.round(TOTAL_FRAMES * 0.10),
    KISS_FADE_OUT: Math.round(TOTAL_FRAMES * 0.18),
    EYES_OPEN: Math.round(TOTAL_FRAMES * 0.25),
    NEUTRAL_SMILE: Math.round(TOTAL_FRAMES * 0.38),
    REMEMBER_FADE_OUT: Math.round(TOTAL_FRAMES * 0.48),
    WINK_START: Math.round(TOTAL_FRAMES * 0.55),
    WINK_PEAK: Math.round(TOTAL_FRAMES * 0.65),
    MAGIC_FADE_OUT: Math.round(TOTAL_FRAMES * 0.75),
    WAVE_START: Math.round(TOTAL_FRAMES * 0.82),
    EXCITED_WAVE: Math.round(TOTAL_FRAMES * 0.93),
    END: TOTAL_FRAMES - 1,
};

const f2pct = (f) => ((f / (TOTAL_FRAMES - 1)) * 100).toFixed(1);

const bokehLayers = [
    { size: 220, x: "8%", y: "15%", opacity: 0.15, speed: 0.15, color: "rgba(255,182,212,0.8)" },
    { size: 180, x: "75%", y: "10%", opacity: 0.1, speed: 0.12, color: "rgba(255,160,200,0.7)" },
    { size: 260, x: "85%", y: "65%", opacity: 0.1, speed: 0.1, color: "rgba(255,200,220,0.7)" },
    { size: 200, x: "15%", y: "70%", opacity: 0.12, speed: 0.14, color: "rgba(255,170,210,0.7)" },
    { size: 120, x: "30%", y: "20%", opacity: 0.2, speed: 0.3, color: "rgba(255,126,179,0.6)" },
    { size: 100, x: "65%", y: "45%", opacity: 0.15, speed: 0.28, color: "rgba(255,150,195,0.6)" },
    { size: 90, x: "20%", y: "50%", opacity: 0.18, speed: 0.35, color: "rgba(255,126,179,0.5)" },
    { size: 110, x: "50%", y: "75%", opacity: 0.12, speed: 0.25, color: "rgba(255,200,225,0.6)" },
    { size: 30, x: "25%", y: "30%", opacity: 0.4, speed: 0.6, color: "rgba(255,255,255,0.9)" },
    { size: 20, x: "70%", y: "25%", opacity: 0.3, speed: 0.55, color: "rgba(255,255,255,0.8)" },
    { size: 25, x: "45%", y: "60%", opacity: 0.3, speed: 0.5, color: "rgba(255,240,245,0.8)" },
    { size: 18, x: "80%", y: "55%", opacity: 0.4, speed: 0.65, color: "rgba(255,255,255,0.9)" },
    { size: 22, x: "10%", y: "40%", opacity: 0.35, speed: 0.58, color: "rgba(255,255,255,0.8)" },
];

export default function Home3D() {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const bokehRefs = useRef([]);
    const textRefs = useRef({});
    const scrollIndicatorRef = useRef(null);
    const progressBarRef = useRef(null);

    const mouseParallaxRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
    const imagesRef = useRef([]);
    const mouseRafRef = useRef(null);

    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);
    const [hasError, setHasError] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const drawFrame = useCallback((frameIndex) => {
        const safeIndex = Math.min(Math.max(0, frameIndex), TOTAL_FRAMES - 1);
        const canvas = canvasRef.current;
        const img = imagesRef.current[safeIndex];

        if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

        const ctx = canvas.getContext("2d", { alpha: false });

        const width = canvas.width;
        const height = canvas.height;

        const imgRatio = img.width / img.height;
        const canvasRatio = width / height;
        let drawW, drawH, drawX, drawY;

        if (imgRatio > canvasRatio) {
            drawH = height;
            drawW = drawH * imgRatio;
        } else {
            drawW = width;
            drawH = drawW / imgRatio;
        }
        drawX = (width - drawW) / 2;
        drawY = (height - drawH) / 2;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            const width = window.innerWidth;
            const height = window.innerHeight;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            const ctx = canvas.getContext("2d", { alpha: false });
            ctx.scale(dpr, dpr);

            if (imagesRef.current.length > 0) {
                drawFrame(0);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [drawFrame]);

    useEffect(() => {
        if (isMobile) return;
        const handleMouseMove = (e) => {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            mouseParallaxRef.current.targetX = -((e.clientX - centerX) / centerX) * 15;
            mouseParallaxRef.current.targetY = -((e.clientY - centerY) / centerY) * 10;
        };

        const lerp = () => {
            const mp = mouseParallaxRef.current;
            const dx = mp.targetX - mp.x;
            const dy = mp.targetY - mp.y;

            if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
                mp.x += dx * 0.08;
                mp.y += dy * 0.08;

                if (canvasRef.current) {
                    canvasRef.current.style.transform = `translate3d(${mp.x}px, ${mp.y}px, 0) scale(1.05)`;
                }

                bokehRefs.current.forEach((el, i) => {
                    if (!el) return;
                    const layer = bokehLayers[i];
                    const bx = mp.targetX * layer.speed * 2.5;
                    const by = mp.targetY * layer.speed * 2.5;
                    el.style.transform = `translate3d(${bx}px, ${by}px, 0)`;
                });
            }
            mouseRafRef.current = requestAnimationFrame(lerp);
        };

        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        mouseRafRef.current = requestAnimationFrame(lerp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            if (mouseRafRef.current) cancelAnimationFrame(mouseRafRef.current);
        };
    }, [isMobile]);

    useEffect(() => {
        if (isMobile || TOTAL_FRAMES === 0) return;

        let loadedCount = 0;
        const images = new Array(TOTAL_FRAMES);

        const onLoad = () => {
            loadedCount++;
            if (loadedCount % 5 === 0 || loadedCount === TOTAL_FRAMES) {
                setLoadProgress(Math.floor((loadedCount / TOTAL_FRAMES) * 100));
            }
            if (loadedCount === TOTAL_FRAMES) {
                imagesRef.current = images;
                setImagesLoaded(true);
            }
        };

        const onError = (e) => {
            console.error("Error cargando imagen:", e.target.src);
            setHasError(true);
            onLoad();
        };

        frameSources.forEach((src, i) => {
            const img = new Image();
            img.src = src;
            img.onload = onLoad;
            img.onerror = onError;
            images[i] = img;
        });
    }, [isMobile]);

    useEffect(() => {
        if (isMobile || !imagesLoaded || hasError) return;

        drawFrame(0);

        const animObj = { frame: 0 };
        gsap.to(animObj, {
            frame: TOTAL_FRAMES - 1,
            snap: "frame",
            ease: "none",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.5,
                pin: ".kitty-pin-container", // Pinneamos solo el contenido interno
                pinSpacing: false,
                invalidateOnRefresh: true,
            },
            onUpdate: () => drawFrame(Math.round(animObj.frame)),
        });

        // T1
        const t1 = textRefs.current.kiss;
        if (t1) {
            gsap.fromTo(t1, { opacity: 0, x: 50, rotationY: 15, scale: 0.9 }, {
                opacity: 1, x: 0, rotationY: 0, scale: 1, ease: "back.out(1.2)",
                scrollTrigger: { trigger: containerRef.current, start: `${f2pct(KEYFRAMES.KISS_START)}% top`, end: `${f2pct(KEYFRAMES.KISS_PEAK)}% top`, scrub: 0.5 },
            });
            gsap.to(t1.querySelector(".pop-target"), {
                color: "#ff4d6d", scale: 1.05, rotation: -2, ease: "elastic.out(1,0.3)",
                scrollTrigger: { trigger: containerRef.current, start: `${f2pct(KEYFRAMES.KISS_PEAK)}% top`, end: `${f2pct(KEYFRAMES.KISS_PEAK + 10)}% top`, scrub: 0.2 },
            });
            gsap.to(t1, {
                opacity: 0, y: -50, ease: "power2.in",
                scrollTrigger: { trigger: containerRef.current, start: `${f2pct(KEYFRAMES.KISS_PEAK + 10)}% top`, end: `${f2pct(KEYFRAMES.KISS_FADE_OUT)}% top`, scrub: 0.3 },
            });
        }

        // T2
        const t2 = textRefs.current.remember;
        if (t2) {
            gsap.fromTo(t2, { opacity: 0, x: -80 }, {
                opacity: 1, x: 0, ease: "power3.out",
                scrollTrigger: { trigger: containerRef.current, start: `${f2pct(KEYFRAMES.EYES_OPEN)}% top`, end: `${f2pct(KEYFRAMES.NEUTRAL_SMILE)}% top`, scrub: 0.4 },
            });
            gsap.to(t2, {
                opacity: 0, x: 80, scale: 1.05, ease: "power2.in",
                scrollTrigger: { trigger: containerRef.current, start: `${f2pct(KEYFRAMES.NEUTRAL_SMILE + 8)}% top`, end: `${f2pct(KEYFRAMES.REMEMBER_FADE_OUT)}% top`, scrub: 0.3 },
            });
        }

        // T3
        const t3 = textRefs.current.magic;
        if (t3) {
            gsap.fromTo(t3, { opacity: 0, y: 100, scale: 0.8 }, {
                opacity: 1, y: 0, scale: 1, ease: "elastic.out(1, 0.7)",
                scrollTrigger: { trigger: containerRef.current, start: `${f2pct(KEYFRAMES.WINK_START)}% top`, end: `${f2pct(KEYFRAMES.WINK_PEAK)}% top`, scrub: 0.4 },
            });
            gsap.to(t3.querySelector(".sparkle-target"), {
                scale: 1.3, rotation: 15, y: -5, ease: "back.out(2)",
                scrollTrigger: { trigger: containerRef.current, start: `${f2pct(KEYFRAMES.WINK_PEAK)}% top`, end: `${f2pct(KEYFRAMES.WINK_PEAK + 6)}% top`, scrub: 0.2 },
            });
            gsap.to(t3, {
                opacity: 0, scale: 0.9, y: -60, ease: "power3.in",
                scrollTrigger: { trigger: containerRef.current, start: `${f2pct(KEYFRAMES.WINK_PEAK + 10)}% top`, end: `${f2pct(KEYFRAMES.MAGIC_FADE_OUT)}% top`, scrub: 0.3 },
            });
        }

        // T4
        const t4 = textRefs.current.cta;
        if (t4) {
            gsap.fromTo(t4, { opacity: 0, y: 100, scale: 0.5, rotationX: -45 }, {
                opacity: 1, y: 0, scale: 1, rotationX: 0, ease: "power4.out",
                scrollTrigger: { trigger: containerRef.current, start: `${f2pct(KEYFRAMES.WAVE_START)}% top`, end: `${f2pct(KEYFRAMES.EXCITED_WAVE)}% top`, scrub: 0.5 },
            });
        }

        if (scrollIndicatorRef.current) {
            gsap.to(scrollIndicatorRef.current, {
                opacity: 0, y: 20, ease: "power2.in",
                scrollTrigger: { trigger: containerRef.current, start: "3% top", end: "8% top", scrub: true },
            });
        }

        if (progressBarRef.current) {
            gsap.to(progressBarRef.current, {
                width: "100%", ease: "none",
                scrollTrigger: { trigger: containerRef.current, start: "top top", end: "bottom bottom", scrub: 0.1 },
            });
        }

        return () => {
            ScrollTrigger.getAll().forEach((t) => t.kill());
        };
    }, [imagesLoaded, drawFrame, hasError, isMobile]);

    const txtShadow = "0 4px 12px rgba(0,0,0,0.5)";
    const glassContainer = "bg-black/30 border border-white/10 p-8 md:p-10 rounded-[2rem] shadow-2xl backdrop-blur-sm";

    if (isMobile) {
        return (
            <div className="bg-[#0a0a0a] min-h-screen">
                {/* HERO BONITO PARA CELULAR */}
                <section className="relative h-[80vh] flex flex-col items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1a0510] to-black z-0" />
                    <div className="relative z-10 text-center px-6 mt-10">
                        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-[#ffd1dc] mb-4">
                            Bienvenidos a <br />
                            <span className="italic font-serif text-pink-400">mi galería</span>
                        </h1>
                        <p className="text-white/70 text-lg">Un pedacito de mi historia para ustedes 💖</p>
                    </div>
                </section>

                {/* SLIDER (Mismo código que abajo) */}
                <section className="relative h-screen min-h-[600px] w-full overflow-hidden flex flex-col items-center justify-center bg-black">
                    <div className="absolute inset-0 z-0 opacity-40">
                        <div className="flex w-[200%] gap-4 mb-4 animate-marquee">
                            {[...staticGalleryImages, ...staticGalleryImages, ...staticGalleryImages].map((img, i) => (
                                <div key={i} className="w-80 h-60 flex-shrink-0">
                                    <img src={img} className="w-full h-full object-cover rounded-2xl shadow-xl" alt="" />
                                </div>
                            ))}
                        </div>
                        <div className="flex w-[200%] gap-4 animate-marquee-reverse">
                            {[...staticGalleryImages, ...staticGalleryImages, ...staticGalleryImages].reverse().map((img, i) => (
                                <div key={i} className="w-80 h-60 flex-shrink-0">
                                    <img src={img} className="w-full h-full object-cover rounded-2xl shadow-xl" alt="" />
                                </div>
                            ))}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-[#0a0a0a]" />
                    </div>

                    <div className="relative z-10 text-center px-6">
                        <h2 className="text-4xl font-black text-white mb-4 drop-shadow-2xl">
                            ¿Lista para revivir <br />
                            <span className="text-pink-400 italic">cada detalle?</span>
                        </h2>
                        <Link to="/gallery" className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-[#ff1493] to-[#ff69b4] text-white font-bold text-xl shadow-[0_10px_40px_rgba(255,20,147,0.4)]">
                            Explorar toda la galería
                            <span>→</span>
                        </Link>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="bg-[#0a0a0a]">
            {/* Loading */}
            {!imagesLoaded && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#ffe4ec]">
                    <div className="text-6xl animate-bounce mb-6">💌</div>
                    <p className="text-[#ff69b4] text-2xl font-bold mb-4 tracking-wider text-center px-4">
                        {hasError ? "Ups, parece que faltan fotos..." : "Preparando mis recuerdos..."}
                    </p>
                    <div className="w-72 h-4 bg-white rounded-full overflow-hidden shadow-inner border border-[#ffb6c1]">
                        <div
                            className="h-full bg-gradient-to-r from-[#ff69b4] to-[#ff1493] rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${loadProgress}%`, backgroundColor: hasError ? 'red' : '' }}
                        />
                    </div>
                </div>
            )}

            {/* SECCIÓN 3D: Pura Kitty animada */}
            <div ref={containerRef} className="relative w-full overflow-x-hidden" style={{ height: SCROLL_HEIGHT_PX }}>
                {/* Este es el contenedor que se queda fijo mientras el de arriba se scrollea */}
                <div className="kitty-pin-container sticky top-0 left-0 w-full h-screen overflow-hidden">
                    {/* Canvas 3D */}
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full object-cover z-0"
                        style={{ display: (imagesLoaded && !hasError) ? "block" : "none", transform: "scale(1.05)" }}
                    />

                    {/* Capas de Bokeh y Parallax */}
                    {imagesLoaded && !hasError && (
                        <div className="absolute inset-0 pointer-events-none z-1 overflow-hidden">
                            {bokehLayers.map((layer, i) => (
                                <div
                                    key={i}
                                    ref={(el) => (bokehRefs.current[i] = el)}
                                    className="absolute rounded-full blur-2xl"
                                    style={{
                                        width: layer.size,
                                        height: layer.size,
                                        left: layer.x,
                                        top: layer.y,
                                        opacity: layer.opacity,
                                        backgroundColor: layer.color,
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Vignette Cinemática */}
                    {imagesLoaded && !hasError && (
                        <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)]" />
                    )}

                    {/* Textos Animados */}
                    {/* Texto 1 */}
                    {imagesLoaded && !hasError && (
                        <div ref={(el) => (textRefs.current.kiss = el)} className="absolute inset-0 z-20 flex flex-col justify-center items-end text-right pr-6 md:pr-24 pointer-events-none opacity-0">
                            <div className={`${glassContainer} max-w-[90%] md:max-w-lg border-r-4 border-r-[#ff69b4]`}>
                                <h2 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-[#ffd1dc] leading-tight mb-3" style={{ filter: `drop-shadow(${txtShadow})` }}>
                                    ¡Bienvenidos a <br /><span className="pop-target inline-block text-white filter drop-shadow-lg italic font-serif">mi galería!</span>
                                </h2>
                                <p className="text-lg md:text-xl text-white/90 font-medium tracking-wide">Un pedacito de mi historia para ustedes 💋</p>
                            </div>
                        </div>
                    )}

                    {/* Texto 2 */}
                    {imagesLoaded && !hasError && (
                        <div ref={(el) => (textRefs.current.remember = el)} className="absolute inset-0 z-20 flex flex-col justify-center items-start text-left pl-6 md:pl-24 pointer-events-none opacity-0">
                            <div className={`${glassContainer} max-w-[90%] md:max-w-lg border-l-4 border-l-[#ff69b4]`}>
                                <h2 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#ffd1dc] leading-tight mb-3" style={{ filter: `drop-shadow(${txtShadow})` }}>
                                    Momentos de <br /> mi cumple
                                </h2>
                                <p className="text-lg md:text-xl text-white/90 font-medium tracking-wide italic font-serif">risas, amigos y días inolvidables </p>
                            </div>
                        </div>
                    )}

                    {/* Texto 3 */}
                    {imagesLoaded && !hasError && (
                        <div ref={(el) => (textRefs.current.magic = el)} className="absolute inset-0 z-20 flex flex-col justify-center items-end text-right pr-6 md:pr-24 pointer-events-none opacity-0">
                            <div className={`${glassContainer} max-w-[90%] md:max-w-lg border-r-4 border-r-[#ffb6c1]`}>
                                <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-3" style={{ textShadow: txtShadow }}>
                                    Gracias por ser <br /> parte de esto
                                </h2>
                                <p className="text-lg md:text-xl text-[#ffd1dc] font-medium tracking-wide italic font-serif">cada recuerdo es mejor si estamos juntos 💖</p>
                            </div>
                        </div>
                    )}

                    {/* Barra de Progreso Superior */}
                    {imagesLoaded && !hasError && (
                        <div className="absolute top-0 left-0 w-full h-1.5 z-40 bg-white/10">
                            <div ref={progressBarRef} className="h-full bg-gradient-to-r from-[#ffb6c1] via-[#ff1493] to-[#ffb6c1] w-0 shadow-[0_0_15px_rgba(255,20,147,0.8)]" />
                        </div>
                    )}
                </div>
            </div>

            {/* SECCIÓN NUEVA: Slider de Galería al Final */}
            {imagesLoaded && !hasError && (
                <section className="relative h-screen min-h-[600px] w-full overflow-hidden flex flex-col items-center justify-center bg-black">
                    {/* El Slider (Background Marquee) */}
                    <div className="absolute inset-0 z-0 opacity-40">
                        {/* Fila 1 */}
                        <div className="flex w-[200%] gap-4 mb-4 animate-marquee">
                            {[...staticGalleryImages, ...staticGalleryImages, ...staticGalleryImages].map((img, i) => (
                                <div key={i} className="w-80 h-60 flex-shrink-0">
                                    <img src={img} className="w-full h-full object-cover rounded-2xl shadow-xl" alt="" />
                                </div>
                            ))}
                        </div>
                        {/* Fila 2 (Sentido inverso) */}
                        <div className="flex w-[200%] gap-4 animate-marquee-reverse">
                            {[...staticGalleryImages, ...staticGalleryImages, ...staticGalleryImages].reverse().map((img, i) => (
                                <div key={i} className="w-80 h-60 flex-shrink-0">
                                    <img src={img} className="w-full h-full object-cover rounded-2xl shadow-xl" alt="" />
                                </div>
                            ))}
                        </div>
                        {/* Overlay Oscuro para legibilidad */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-[#0a0a0a]" />
                    </div>

                    {/* Contenido Superior (CTA) */}
                    <div className="relative z-10 text-center px-6">
                        <h2 className="text-4xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl">
                            ¿Lista para revivir <br />
                            <span className="text-pink-400 italic">cada detalle?</span>
                        </h2>
                        <Link to="/gallery" className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-[#ff1493] to-[#ff69b4] text-white font-bold text-xl md:text-2xl shadow-[0_10px_40px_rgba(255,20,147,0.4)] hover:scale-110 hover:shadow-[0_20px_60px_rgba(255,20,147,0.6)] transition-all duration-300">
                            Explorar toda la galería
                            <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                        </Link>
                    </div>

                    {/* Footer Decorativo */}
                    <div className="absolute bottom-8 left-0 w-full flex justify-center items-center gap-4 text-white/30 text-sm tracking-widest uppercase">
                        <div className="h-px w-12 bg-white/20" />
                        <span>Sele Gallery © 2026</span>
                        <div className="h-px w-12 bg-white/20" />
                    </div>
                </section>
            )}
        </div>
    );
}