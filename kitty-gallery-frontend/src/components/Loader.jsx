export default function Loader() {
    return (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
            {/* Spinning kitty bow */}
            <div className="text-5xl animate-spin-slow mb-4">🎀</div>
            <p className="text-kitty-rose text-lg font-semibold animate-pulse">
                Cargando recuerdos...
            </p>
            <div className="mt-4 flex gap-2">
                <span className="w-2 h-2 bg-kitty-rose rounded-full animate-bounce" style={{ animationDelay: "0s" }}></span>
                <span className="w-2 h-2 bg-kitty-rose rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></span>
                <span className="w-2 h-2 bg-kitty-rose rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></span>
            </div>
        </div>
    );
}
