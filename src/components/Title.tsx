import { FetchGameSettingsData } from "../tools/fetchData";

interface props {
    glow?: boolean;
}

export default function Title({ glow = false }: props){
    return(
        <h1 className={`text-1xl font-display font-bold tracking-tight ${glow ? 'drop-shadow-[0_0_25px_rgba(200,155,94,0.6)]' : ''}`}>
            <span className="text-accent-primary">
                {FetchGameSettingsData(0).CurrentTitle}
            </span>
        </h1>
    )
}
