import { setLocalItem } from "../../storage/localStorage";

export function reload(){
    window.location.reload();
}

export function reloadWindowOpen(){
    setLocalItem("open-profile-on-load", "true");
    window.location.reload();
}
