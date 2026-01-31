
import axios from 'axios';
import { CONFIG } from '../config';

const BASE_URL = CONFIG.API_BASE_URL;

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
