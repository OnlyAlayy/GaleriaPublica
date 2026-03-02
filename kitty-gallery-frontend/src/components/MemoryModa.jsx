import { useState, useEffect } from "react";

// Iconos SVG (puedes moverlos a un archivo aparte si quieres)
const Icons = {
    close: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    prev: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
    ),
    next: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    ),
    photo: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
};

export default function MemoryModal({ memory, onClose }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const allImages = [memory.coverImage, ...(memory.images || [])];

    const handlePrev = () => {
        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
    };

    const handleNext = () => {
        setCurrentImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
    };

    // Efecto para capturar teclas (opcional)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === "ArrowRight") handleNext();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose, handlePrev, handleNext]);

    return (
        <div
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-5xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Botón cerrar - más elegante */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 hover:scale-110"
                    aria-label="Cerrar"
                >
                    {Icons.close}
                </button>

                {/* Contenedor de imagen y navegación */}
                <div className="relative">
                    {/* Imagen actual */}
                    <div className="relative aspect-video sm:aspect-[16/9] w-full bg-black/40">
                        <img
                            src={allImages[currentImageIndex].url}
                            alt={`Imagen ${currentImageIndex + 1}`}
                            className="w-full h-full object-contain transition-opacity duration-300"
                        />
                    </div>

                    {/* Controles de navegación - más grandes y con mejor feedback */}
                    {allImages.length > 1 && (
                        <>
                            <button
                                onClick={handlePrev}
                                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                                aria-label="Anterior"
                            >
                                {Icons.prev}
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                                aria-label="Siguiente"
                            >
                                {Icons.next}
                            </button>
                        </>
                    )}
                </div>

                {/* Pie con información y contador */}
                <div className="p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl sm:text-2xl font-bold mb-1 truncate">{memory.title}</h3>
                            <p className="text-sm sm:text-base text-white/80 line-clamp-2">{memory.description}</p>
                            {memory.date && (
                                <p className="text-xs sm:text-sm text-white/60 mt-2 flex items-center gap-1">
                                    {Icons.photo}
                                    <span>{new Date(memory.date).toLocaleDateString("es-AR", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}</span>
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-white/80 text-sm sm:text-base bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm self-start sm:self-auto">
                            <span className="font-medium">{currentImageIndex + 1}</span>
                            <span>/</span>
                            <span>{allImages.length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}