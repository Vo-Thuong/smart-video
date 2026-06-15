import axios from "axios";

const api = axios.create({
  // Tự động lấy link Render trên Vercel, nếu không có sẽ lấy dưới máy local
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true,
});

export default api;
