require("dotenv").config();
const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;

console.log("Đang thử kết nối tới:");
console.log(uri);

if (!uri) {
  console.error("❌ Không tìm thấy MONGODB_URI trong file .env!");
  process.exit(1);
}

mongoose
  .connect(uri)
  .then(() => {
    console.log("✅ KẾT NỐI MONGODB THÀNH CÔNG RỰC RỠ!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ LỖI KẾT NỐI DB:");
    console.error(err);
    process.exit(1);
  });
