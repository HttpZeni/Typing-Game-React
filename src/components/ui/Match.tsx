import { type Round } from "../../services/supabaseData"

interface props{
    data: Round
    classname?: string
}

export default function Match({ data, classname}: props){
    return(
        <div className={`w-full h-16 bg-card-bg border border-card-border rounded-lg ${classname} px-4 py-2 flex items-center justify-between transition-all duration-200 hover:border-accent-primary hover:shadow-glow-purple group`}>
            
            <div className="flex flex-col items-center min-w-[60px]">
                <div className="text-text-secondary text-[10px] font-display font-semibold uppercase tracking-wider mb-0.5">
                    Time
                </div>
                <div className="text-lg font-display font-bold text-text-primary">
                    {data.time}s
                </div>
            </div>

            <div className="h-8 w-px bg-card-border group-hover:bg-accent-primary/30 transition-colors"></div>

            <div className="flex flex-col items-center min-w-[70px]">
                <div className="text-text-secondary text-[10px] font-display font-semibold uppercase tracking-wider mb-0.5">
                    Accuracy
                </div>
                <div className="text-lg font-display font-bold text-accent-primary">
                    {data.accuracy}%
                </div>
            </div>

            <div className="h-8 w-px bg-card-border group-hover:bg-accent-primary/30 transition-colors"></div>

            <div className="flex flex-col items-center min-w-[60px]">
                <div className="text-text-secondary text-[10px] font-display font-semibold uppercase tracking-wider mb-0.5">
                    WPM
                </div>
                <div className="text-lg font-display font-bold text-accent-secondary">
                    {data.wpm}
                </div>
            </div>

            <div className="h-8 w-px bg-card-border group-hover:bg-accent-primary/30 transition-colors"></div>

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