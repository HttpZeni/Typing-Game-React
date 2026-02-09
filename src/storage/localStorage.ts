type items = "logged in" | "open-profile-on-load" | "theme" | "theme-index";

export function setLocalItem(item: items, value: string){
    localStorage.setItem(item, value);
}

export function getLocalItem(item: items): string{
    const output = localStorage.getItem(item);
    if (!output) return "";
    return output;
}

export function removeLocalItem(item: items){
    localStorage.removeItem(item);
}
