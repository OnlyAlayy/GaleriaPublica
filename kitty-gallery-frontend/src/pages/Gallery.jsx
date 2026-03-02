import { useState, useEffect } from "react";
import { fetchMemories } from "../services/api";
import Header from "../components/Header";
import GalleryGrid from "../components/GalleryGrid";
import Loader from "../components/Loader";
import MemoryModal from "../components/MemoryModa"; // Importamos el modal

export default function Gallery() {
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMemory, setSelectedMemory] = useState(null); // Estado para el modal

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchMemories();
                setMemories(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleRetry = () => {
        setLoading(true);
        setError(null);
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#fff0f5] to-[#ffe4e1] font-sans text-[#4a4a4a] selection:bg-[#ffb6c1] selection:text-white flex flex-col">
            <Header />

            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 md:pt-20 pb-12 sm:pb-16 md:pb-20">

                {/* Título de la Galería */}
                {!loading && !error && (
                    <div className="text-center mb-10 sm:mb-14 md:mb-20 animate-fade-in px-2">
                        <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-[#d24d88] mb-2 sm:mb-3 tracking-tight leading-tight">
                            Nuestros Mejores Recuerdos
                        </h1>
                        <div className="flex items-center justify-center gap-2 sm:gap-4 mt-3 sm:mt-4 mb-3 sm:mb-5">
                            <div className="h-px sm:h-[2px] w-6 sm:w-8 md:w-16 bg-[#ffb6c1] rounded-full"></div>
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff8cbe] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            <div className="h-px sm:h-[2px] w-6 sm:w-8 md:w-16 bg-[#ffb6c1] rounded-full"></div>
                        </div>
                    </div>
                )}

                {/* Estado de Carga */}
                {loading && (
                    <div className="min-h-[50vh] sm:min-h-[60vh] flex justify-center items-center py-12 sm:py-16">
                        <Loader />
                    </div>
                )}

                {/* Estado de Error */}
                {error && (
                    <div className="flex justify-center py-8 sm:py-12 md:py-16 animate-fade-in-up px-4">
                        <div className="bg-white/80 backdrop-blur-md p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl shadow-sm border border-white text-center max-w-sm sm:max-w-md w-full">
                            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-[#ffe4e1] rounded-full flex items-center justify-center mb-4 sm:mb-6">
                                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#ff69b4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-[#ff1493] mb-2 sm:mb-3">¡Ups! Algo salió mal</h3>
                            <p className="text-sm sm:text-base text-[#d24d88]/80 mb-6 sm:mb-8 leading-relaxed">Tuvimos un problema al cargar los recuerdos. {error}</p>
                            <button onClick={handleRetry} className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-[#ff1493] hover:bg-[#d24d88] text-white rounded-full font-semibold transition-all transform hover:scale-105 active:scale-100 shadow-md text-sm sm:text-base">Intentar de nuevo</button>
                        </div>
                    </div>
                )}

                {/* Álbum vacío */}
                {!loading && !error && memories.length === 0 && (
                    <div className="flex justify-center mt-4 sm:mt-8 mb-10 animate-fade-in-up px-4">
                        <div className="bg-white/70 backdrop-blur-md p-6 sm:p-8 md:p-14 rounded-2xl sm:rounded-[2rem] shadow-[0_8px_30px_rgb(255,182,193,0.3)] border border-white text-center max-w-sm sm:max-w-xl w-full">
                            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-[#ffe4e1] rounded-full flex items-center justify-center mb-4 sm:mb-6">
                                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#ff69b4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#d24d88] mb-2 sm:mb-3">El álbum está esperando</h3>
                            <p className="text-sm sm:text-base md:text-lg text-[#d24d88]/70 leading-relaxed px-2 sm:px-4">Aún no hay fotos para mostrar. ¡Es el momento perfecto para empezar a guardar esos recuerdos!</p>
                        </div>
                    </div>
                )}

                {/* Grilla de Fotos con modal */}
                {!loading && !error && memories.length > 0 && (
                    <>
                        <div className="animate-fade-in-up px-2 sm:px-0">
                            <GalleryGrid
                                memories={memories}
                                onMemoryClick={setSelectedMemory} // Pasamos la función para abrir el modal
                            />
                        </div>

                        {/* Modal de visualización */}
                        {selectedMemory && (
                            <MemoryModal
                                memory={selectedMemory}
                                onClose={() => setSelectedMemory(null)}
                            />
                        )}
                    </>
                )}

            </main>

            {/* Footer */}
            <footer className="w-full text-center py-4 sm:py-6 mt-auto px-4">
                <div className="inline-flex flex-col xs:flex-row items-center gap-1 xs:gap-2 text-[#d24d88]/60 text-xs font-medium tracking-wider uppercase">
                    <span>Creado para guardar recuerdos</span>
                    <div className="flex items-center gap-1 xs:gap-2">
                        <svg className="w-3 h-3 text-[#ffb6c1]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        <span>{new Date().getFullYear()}</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}