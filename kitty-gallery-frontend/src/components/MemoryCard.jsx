import { useState } from "react";

// Iconos SVG reutilizables (puedes moverlos a un archivo aparte)
const Icons = {
    camera: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    heart: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    ),
    calendar: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    images: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    ribbon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
    ),
};

export default function MemoryCard({ memory, index, onClick }) {
    const [isHovered, setIsHovered] = useState(false);
    const hasMoreImages = memory.images && memory.images.length > 0;

    const formattedDate = new Date(memory.date).toLocaleDateString("es-AR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div
            onClick={onClick}
            className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer animate-fade-in-up bg-white border border-gray-100"
            style={{ animationDelay: `${index * 0.1}s` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative overflow-hidden aspect-[4/3]">
                <img
                    src={memory.coverImage.url}
                    alt={memory.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? "scale-110" : "scale-100"
                        }`}
                    loading="lazy"
                />

                {/* Overlay degradado en hover */}
                <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"
                        }`}
                />

                {/* Indicador de imágenes adicionales */}
                {hasMoreImages && (
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                        {Icons.images}
                        <span>+{memory.images.length}</span>
                    </div>
                )}

                {/* Ribbon decorativo */}
                <div className="absolute top-3 right-3 text-pink-300 opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-md">
                    {Icons.ribbon}
                </div>

                {/* Texto en hover */}
                <div
                    className={`absolute bottom-0 left-0 right-0 p-4 text-white transition-all duration-500 ${isHovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                        }`}
                >
                    <h3 className="text-lg font-bold mb-1 drop-shadow-lg line-clamp-1">
                        {memory.title}
                    </h3>
                    <p className="text-sm text-white/90 line-clamp-2 drop-shadow-md mb-2">
                        {memory.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-white/80 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full w-fit">
                        {Icons.calendar}
                        <span>{formattedDate}</span>
                    </div>
                </div>
            </div>

            {/* Barra inferior con información visible siempre */}
            <div className="px-4 py-3 flex items-center justify-between bg-white border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 truncate flex-1">
                    {memory.title}
                </h3>
                {hasMoreImages && (
                    <span className="text-xs text-pink-500 flex items-center gap-1 ml-2">
                        {Icons.images}
                        <span>{memory.images.length}</span>
                    </span>
                )}
            </div>
        </div>
    );
}