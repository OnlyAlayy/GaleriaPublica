import MemoryCard from "./MemoryCard";

export default function GalleryGrid({ memories, onMemoryClick }) {  // ← recibe la prop
    if (memories.length === 0) {
        return (
            <div className="text-center py-20 animate-fade-in-up">
                <div className="text-6xl mb-4 animate-float">🌸</div>
                <p className="text-kitty-gray text-xl font-medium">
                    Aún no hay recuerdos guardados
                </p>
                <p className="text-kitty-gray/70 mt-2">
                    ¡Los momentos más bonitos están por venir! ✨
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 pb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {memories.map((memory, index) => (
                    <MemoryCard
                        key={memory._id}
                        memory={memory}
                        index={index}
                        onClick={() => onMemoryClick(memory)}  // ← pasa la función
                    />
                ))}
            </div>
        </div>
    );
}