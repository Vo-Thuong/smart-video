if (typeof window !== "undefined") {
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // 1. Vá lỗi cho hàm fetch mặc định
  const originalFetch = window.fetch;
  window.fetch = async function (input, init) {
    if (typeof input === "string" && input.includes("localhost:5000")) {
      input = input.replace("http://localhost:5000", BACKEND_URL);
    }
    return originalFetch.call(this, input, init);
  };

  // 2. Vá lỗi cho thư viện Axios (nếu có file nào import trực tiếp)
  try {
    const axios = require("axios");
    if (axios && axios.interceptors) {
      axios.interceptors.request.use((config: any) => {
        if (config.url && config.url.includes("localhost:5000")) {
          config.url = config.url.replace("http://localhost:5000", BACKEND_URL);
        }
        return config;
      });
    }
  } catch (e) {
    // Nếu không có axios toàn cục thì bỏ qua
  }
}
