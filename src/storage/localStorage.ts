type items = "logged in" | "open-profile-on-load";

export function setLocalItem(item: items, value: string){
    localStorage.setItem(item, value);
}

export function getLocalItem(item: items){
    return localStorage.getItem(item);
}

export function removeLocalItem(item: items){
    localStorage.removeItem(item);
}
