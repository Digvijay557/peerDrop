import axios from "axios";

const api = axios.create({                                             // ← fixed: axios.create, not api.create
    baseURL: import.meta.env.VITE_API_URL, // or process.env.REACT_APP_API_URL
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;