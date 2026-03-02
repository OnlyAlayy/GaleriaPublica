import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Header() {
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    // Detectar scroll para cambiar estilo del header
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Determinar si estamos en la página de inicio
    const isHome = location.pathname === '/';

    return (
        <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-md'
            : 'bg-white/60 backdrop-blur-xl border-b border-white/50'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 md:h-20">

                    {/* Logo/Título - CORREGIDO: ya no está pegado a la izquierda */}
                    <div className="flex items-center ml-0 sm:ml-2">
                        <Link to="/" className="group flex items-center gap-1.5 sm:gap-2">
                            <span className="font-sans font-extrabold text-lg sm:text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#ff1493] to-[#ff8cbe] tracking-tight group-hover:opacity-80 transition-opacity duration-300">
                                Mi Galería
                            </span>
                            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#ff1493] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        </Link>
                    </div>

                    {/* Navegación - Mejorada para móvil */}
                    <nav className="flex items-center gap-2 sm:gap-3">
                        {!isHome && (
                            <Link
                                to="/"
                                className="text-[#d24d88] font-semibold text-xs sm:text-sm md:text-base hover:text-[#ff1493] transition-all duration-300 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg hover:bg-white/60 active:bg-white/80 whitespace-nowrap"
                            >
                                <span className="hidden sm:inline">Volver al </span>Inicio
                            </Link>
                        )}

                        {/* Botón de menú hamburguesa para móvil */}
                        <button
                            className="lg:hidden p-2 text-[#d24d88] hover:text-[#ff1493] rounded-lg hover:bg-white/60"
                            aria-label="Menú"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </nav>

                </div>
            </div>
        </header>
    );
}