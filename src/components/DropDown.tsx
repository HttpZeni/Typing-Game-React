interface props{
    options: string[]
    label?: string
    onChange?: (value: any) => void
}

export default function DropDown({ options, label, onChange }: props){

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange?.(e.target.value);
    };

    return(
        <label>
            {label}
            <select onChange={handleChange} className="bg-card-bg border-2 border-card-border rounded-lg h-9 w-fit px-3 transition-all duration-200 hover:border-accent-primary active:border-accent-primary active:scale-95 text-text-primary font-semibold">
                {options.map((item, index) => (
                    <option key={index} value={item} >{item}</option>
                ))}
            </select>
        </label>
    )
}