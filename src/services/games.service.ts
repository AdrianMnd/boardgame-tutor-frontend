import axios from "axios";

import type { Game } from "../types/Game";


const API_URL = "http://localhost:3000/api/games";


export async function getGames(): Promise<Game[]> {

    const response = await axios.get<Game[]>(
        API_URL
    );

    return response.data;

}