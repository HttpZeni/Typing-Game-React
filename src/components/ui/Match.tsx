interface props{
    data: {
        created_at: string
        text: string
        time: number
        accuracy: number
        wpm: number
        errorLetters: string[]
    }
    classname?: string
}

export default function Match({ data, classname}: props){
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('de-DE', { 
            hour: '2-digit', 
            minute: '2-digit'
        });
    };

    return(
        <div className={`w-full h-16 bg-card-bg border border-card-border rounded-lg ${classname} px-4 py-2 flex items-center justify-between transition-all duration-200 hover:border-accent-primary hover:shadow-glow-purple group`}>
            
            <div className="flex flex-col items-start min-w-[90px] max-w-[90px]">
                <div className="text-text-secondary text-[10px] font-display font-semibold uppercase tracking-wider mb-0.5">
                    Date
                </div>
                <div className="text-xs font-display font-bold text-text-primary">
                    {formatDate(data.created_at)}
                </div>
                <div className="text-[10px] font-display font-semibold text-text-secondary opacity-70">
                    {formatTime(data.created_at)}
                </div>
            </div>

            <div className="h-10 w-px bg-card-border group-hover:bg-accent-primary/30 transition-colors"></div>

            <div className="flex flex-col items-center min-w-[60px]">
                <div className="text-text-secondary text-[10px] font-display font-semibold uppercase tracking-wider mb-0.5">
                    Time
                </div>
                <div className="text-lg font-display font-bold text-text-primary">
                    {data.time}s
                </div>
            </div>

            <div className="h-10 w-px bg-card-border group-hover:bg-accent-primary/30 transition-colors"></div>

            <div className="flex flex-col items-center min-w-[70px]">
                <div className="text-text-secondary text-[10px] font-display font-semibold uppercase tracking-wider mb-0.5">
                    Accuracy
                </div>
                <div className="text-lg font-display font-bold text-accent-primary">
                    {data.accuracy}%
                </div>
            </div>

            <div className="h-10 w-px bg-card-border group-hover:bg-accent-primary/30 transition-colors"></div>

            <div className="flex flex-col items-center min-w-[60px]">
                <div className="text-text-secondary text-[10px] font-display font-semibold uppercase tracking-wider mb-0.5">
                    WPM
                </div>
                <div className="text-lg font-display font-bold text-accent-secondary">
                    {data.wpm}
                </div>
            </div>

            <div className="h-10 w-px bg-card-border group-hover:bg-accent-primary/30 transition-colors"></div>

            <div className="flex flex-col items-center min-w-[70px]">
                <div className="text-text-secondary text-[10px] font-display font-semibold uppercase tracking-wider mb-0.5">
                    Errors
                </div>
                <div className="text-lg font-display font-bold text-accent-warning">
                    {data.errorLetters.length}
                </div>
            </div>

        </div>
    )
}
