interface props {
    text?: string;
}

export default function LoadingScreen({ text = "Loading..." }: props) {
    return (
        <div className="w-screen h-screen bg-game-bg flex flex-col items-center justify-center gap-8">
            <div className="relative w-24 h-24">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-3 h-3 bg-accent-primary rounded-full"
                        style={{
                            top: '50%',
                            left: '50%',
                            transform: `rotate(${i * 45}deg) translateY(-40px)`,
                            animation: `pulse-glow 1.2s ease-in-out infinite`,
                            animationDelay: `${i * 0.15}s`,
                        }}
                    />
                ))}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-accent-warning rounded-full shadow-glow-purple animate-pulse" />
            </div>

            <div className="flex flex-col items-center gap-2">
                <h2 className="text-2xl font-display font-bold text-accent-primary animate-pulse">
                    {text}
                </h2>
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-2 h-2 bg-accent-warning rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-accent-secondary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
            </div>

            <style>{`
                @keyframes pulse-glow {
                    0%, 100% {
                        opacity: 0.3;
                        transform: rotate(var(--rotation)) translateY(-40px) scale(0.8);
                    }
                    50% {
                        opacity: 1;
                        transform: rotate(var(--rotation)) translateY(-40px) scale(1.2);
                        box-shadow: 0 0 20px rgba(200, 155, 94, 0.8);
                    }
                }
            `}</style>
        </div>
    );
}