import Match from "../ui/Match"
import { type Round } from "../../services/supabaseData"

interface props{
    rounds: Round[]
}

export default function MatchHistory({ rounds } : props){
    return (
        <div className="w-full h-full overflow-y-auto overflow-x-hidden blur-[0.6px] px-4 py-2 scrollbar-thin scrollbar-thumb-card-border scrollbar-track-transparent hover:scrollbar-thumb-accent-primary">
            {rounds.map((round, index) => (
                <Match key={index} data={round} classname="my-2" />
            ))}
        </div>
    )
}