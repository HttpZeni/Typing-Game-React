import supabase from "../data/supabase-client";
import { FetchGameData } from "./fetchData";

export default async function addUserStatsData() {
    const newData = {
        Round: 0,
        Time: FetchGameData(0).Seconds,
        WPM: FetchGameData(0).WPM,
        Accuracy: FetchGameData(0).Accurancy,
        Errors: FetchGameData(0).Errors,
        ErrorLetters: {}
    }

    const {data, error} = await supabase.from("UserStats").insert([newData]).single();

    if (error){
        console.log("Error saving user stats: ", error);
    }
    else{
        console.log(data);
    }
}