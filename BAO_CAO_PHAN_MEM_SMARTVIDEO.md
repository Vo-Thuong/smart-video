# BÁO CÁO PHÂN TÍCH DỰ ÁN PHẦN MỀM SMART VIDEO

## MỤC LỤC

1. [Tổng Quan Dự Án](#1-tổng-quan-dự-án)
2. [Giới Thiệu Hệ Thống](#2-giới-thiệu-hệ-thống)
3. [Công Nghệ Sử Dụng](#3-công-nghệ-sử-dụng)
4. [Kiến Trúc Hệ Thống](#4-kiến-trúc-hệ-thống)
5. [Cấu Trúc Thư Mục Dự Án](#5-cấu-trúc-thư-mục-dự-án)
6. [Phân Tích Chức Năng](#6-phân-tích-chức-năng)
7. [Phân Tích Frontend](#7-phân-tích-frontend)
8. [Phân Tích Backend](#8-phân-tích-backend)
9. [Phân Tích Database](#9-phân-tích-database)
10. [Phân Tích API](#10-phân-tích-api)
11. [Phân Tích AI và Video Processing](#11-phân-tích-ai-và-video-processing)
12. [Phân Tích Bảo Mật](#12-phân-tích-bảo-mật)
13. [Đánh Giá Chất Lượng Mã Nguồn](#13-đánh-giá-chất-lượng-mã-nguồn)
14. [Ưu Điểm Của Hệ Thống](#14-ưu-điểm-của-hệ-thống)
15. [Hạn Chế và Rủi Ro](#15-hạn-chế-và-rủi-ro)
16. [Đề Xuất Cải Tiến](#16-đề-xuất-cải-tiến)
17. [Kết Luận](#17-kết-luận)

---

## 1. TỔNG QUAN DỰ ÁN

### Tên dự án

**Smart Video** — Nền tảng học tiếng Anh thông minh qua video AI

### Mục tiêu dự án

Smart Video được xây dựng nhằm mục tiêu cung cấp một nền tảng học tiếng Anh hiệu quả thông qua việc kết hợp nội dung video (YouTube và video tải lên) với trí tuệ nhân tạo (AI). Hệ thống tự động phân tích, phiên âm và tạo transcript từ video, giúp người học luyện nghe, luyện đọc và tích lũy từ vựng một cách tương tác.

### Bài toán cần giải quyết

- Người học tiếng Anh thiếu công cụ luyện nghe chủ động từ nội dung mình yêu thích
- Việc ghi chép từ vựng mới từ video truyền thống là thủ công và tốn thời gian
- Không có hệ thống gợi ý video học tiếng Anh phù hợp với từng trình độ và sở thích cá nhân
- Thiếu môi trường học tập cộng đồng để chia sẻ tiến trình học

### Đối tượng sử dụng

- Học sinh, sinh viên đang học tiếng Anh
- Người đi làm muốn cải thiện kỹ năng nghe tiếng Anh
- Người đang ôn luyện IELTS, TOEIC
- Bất kỳ ai muốn học tiếng Anh thông qua nội dung video yêu thích

### Giá trị mang lại

- Học từ vựng theo ngữ cảnh thực tế từ video YouTube và video tải lên
- Gợi ý video học tiếng Anh cá nhân hóa bằng AI (Google Gemini)
- Theo dõi tiến trình học tập hằng ngày (streak, điểm, thời gian học)
- Chia sẻ bài học và từ vựng với bạn bè trong cộng đồng

---

## 2. GIỚI THIỆU HỆ THỐNG

### Hệ thống dùng để làm gì

Smart Video là một ứng dụng web học tiếng Anh kết hợp với AI, cho phép người dùng:

- Nhập URL video YouTube hoặc tải lên video cá nhân để luyện nghe
- Xem transcript (phụ đề) đồng bộ theo thời gian thực khi xem video
- Tra cứu từ vựng từ nội dung transcript và lưu vào danh sách cá nhân
- Nhận gợi ý video tiếng Anh phù hợp với hồ sơ học tập cá nhân
- Tương tác với cộng đồng qua bảng tin (feed), kết bạn và chia sẻ tiến trình

### Quy trình hoạt động tổng quát

```
Người dùng
    |
    v
[Đăng ký / Đăng nhập] ---> [Onboarding Survey]
    |                             |
    v                             v
[Dashboard]  <-----------  [Cá nhân hóa hồ sơ học]
    |
    +-- [Nhập URL YouTube] ---> [Xem video + Transcript] ---> [Lưu từ vựng]
    |
    +-- [Tải lên video] ---> [AI tạo transcript (Gemini/Deepgram)] ---> [Luyện nghe]
    |
    +-- [Gợi ý video AI] ---> [Chọn video phù hợp] ---> [Lưu vào thư viện]
    |
    +-- [Thư viện video] ---> [Luyện tập theo transcript] ---> [Ghi nhận tiến trình]
    |
    +-- [Từ điển từ vựng] ---> [Ôn tập flashcard]
    |
    +-- [Feed cộng đồng] ---> [Kết bạn / Chia sẻ]
```

### Các chức năng chính

| STT | Chức năng           | Mô tả                                                     |
| --- | ------------------- | --------------------------------------------------------- |
| 1   | Đăng ký / Đăng nhập | Hỗ trợ email/mật khẩu và Google OAuth                     |
| 2   | Khảo sát onboarding | Thu thập hồ sơ học tập để cá nhân hóa gợi ý               |
| 3   | Lưu video YouTube   | Lưu video từ URL YouTube vào thư viện cá nhân             |
| 4   | Tải lên video       | Upload video từ máy tính, AI tạo transcript tự động       |
| 5   | Luyện tập video     | Xem video + transcript tương tác, đánh dấu đoạn đã học    |
| 6   | Gợi ý video AI      | Đề xuất video YouTube học tiếng Anh theo hồ sơ người dùng |
| 7   | Tra cứu từ điển     | Tra nghĩa từ vựng ngay trong transcript                   |
| 8   | Quản lý từ vựng     | Lưu, ôn tập và đánh dấu từ đã học                         |
| 9   | Bộ sưu tập          | Phân loại video và từ vựng theo chủ đề                    |
| 10  | Bảng tin (Feed)     | Chia sẻ video đã học và từ vựng với cộng đồng             |
| 11  | Hệ thống bạn bè     | Kết bạn, gửi/nhận lời mời kết bạn                         |
| 12  | Theo dõi tiến trình | Streak học tập, điểm số, lịch sử xem                      |
| 13  | Nâng cấp Pro        | Gói premium với tính năng nâng cao                        |
| 14  | Nhắc nhở học        | Email nhắc nhở streak hằng ngày lúc 10:00 sáng            |

---

## 3. CÔNG NGHỆ SỬ DỤNG

### Bảng công nghệ tổng hợp

| Thành phần           | Công nghệ                     | Phiên bản   | Mục đích sử dụng                               | File tham chiếu                                 |
| -------------------- | ----------------------------- | ----------- | ---------------------------------------------- | ----------------------------------------------- |
| Frontend Framework   | Next.js                       | 16.1.6      | React framework SSR/CSR                        | frontend-new/package.json                       |
| UI Language          | TypeScript                    | ^5          | Type-safe frontend                             | frontend-new/tsconfig.json                      |
| Styling              | Tailwind CSS                  | ^4.3.0      | Utility-first CSS                              | frontend-new/tailwind.config.ts                 |
| UI Components        | Radix UI                      | ^1.4.3      | Headless accessible UI                         | frontend-new/package.json                       |
| Animations           | Framer Motion                 | ^12.38.0    | Declarative animations                         | frontend-new/package.json                       |
| Icons                | Lucide React                  | ^0.562.0    | Bộ icon SVG                                    | frontend-new/package.json                       |
| HTTP Client          | Axios                         | ^1.13.2     | Gọi API từ frontend                            | frontend-new/package.json                       |
| Toast Notifications  | Sonner                        | ^2.0.7      | Thông báo toast                                | frontend-new/package.json                       |
| Video Player         | React Player                  | ^3.4.0      | Phát video trong ứng dụng                      | frontend-new/package.json                       |
| Theme                | next-themes                   | ^0.4.6      | Dark/Light mode                                | frontend-new/package.json                       |
| Backend Runtime      | Node.js                       | LTS         | JavaScript server runtime                      | backend/package.json                            |
| Backend Framework    | Express.js                    | ^5.2.1      | Web API framework                              | backend/package.json                            |
| Database             | MongoDB                       | Atlas/Local | NoSQL document database                        | backend/.env.example                            |
| ODM                  | Mongoose                      | ^9.6.1      | MongoDB object modeling                        | backend/package.json                            |
| Authentication       | JWT (jsonwebtoken)            | ^9.0.3      | Token-based auth                               | backend/src/middleware/authMiddleware.js        |
| OAuth                | Google OAuth                  | ^10.6.2     | Đăng nhập Google                               | backend/src/controllers/authController.js       |
| OAuth Client         | @react-oauth/google           | ^0.13.5     | Google login button                            | frontend-new/package.json                       |
| Password Hashing     | bcryptjs                      | ^3.0.3      | Băm mật khẩu                                   | backend/src/controllers/authController.js       |
| AI — Transcription   | Google Gemini AI              | ^0.24.1     | Phiên âm audio sang text                       | backend/src/controllers/videoController.js      |
| AI — Fallback        | Deepgram API                  | REST        | Dự phòng phiên âm audio                        | backend/src/controllers/videoController.js      |
| AI — Recommendations | Google Gemini AI              | ^0.24.1     | Tạo search queries video                       | backend/src/controllers/recommendController.js  |
| YouTube Download     | youtube-dl-exec               | ^3.1.7      | Tải/stream video YouTube                       | backend/src/controllers/videoController.js      |
| YouTube Transcript   | youtube-transcript            | ^1.3.1      | Lấy phụ đề YouTube sẵn có                      | backend/src/controllers/transcriptController.js |
| YouTube Search       | yt-search                     | ^2.13.1     | Tìm kiếm video YouTube                         | backend/src/controllers/recommendController.js  |
| Video Processing     | fluent-ffmpeg                 | ^2.1.3      | Trích xuất audio/thumbnail                     | backend/src/controllers/videoController.js      |
| File Upload          | Multer                        | ^2.0.2      | Xử lý multipart/form-data                      | backend/src/controllers/videoController.js      |
| Email                | Nodemailer                    | ^8.0.10     | Gửi email SMTP (Gmail)                         | backend/src/services/emailService.js            |
| Cron Jobs            | node-cron                     | ^4.2.1      | Lên lịch nhắc nhở hằng ngày                    | backend/src/services/reminderScheduler.js       |
| CORS                 | cors                          | ^2.8.6      | Cross-origin resource sharing                  | backend/src/server.js                           |
| Environment          | dotenv                        | ^17.4.2     | Quản lý biến môi trường                        | backend/src/server.js                           |
| Internationalization | Custom i18n                   | tự viết     | Hỗ trợ Anh/Việt                                | frontend-new/lib/i18n.tsx                       |
| Cloud Storage        | Cloudinary                    | ^2.9.0      | Upload ảnh (cài nhưng chưa tích hợp hoàn toàn) | backend/package.json                            |
| Dictionary API       | Free Dictionary API           | REST free   | Tra nghĩa tiếng Anh                            | backend/src/controllers/dictionaryController.js |
| Dictionary Fallback  | Wiktionary + Google Translate | REST free   | Dự phòng tra từ điển                           | backend/src/controllers/dictionaryController.js |
| Docker               | Không tìm thấy trong mã nguồn | —           | —                                              | —                                               |
| CI/CD                | Không tìm thấy trong mã nguồn | —           | —                                              | —                                               |
| Testing              | Không tìm thấy trong mã nguồn | —           | —                                              | —                                               |

---

## 4. KIẾN TRÚC HỆ THỐNG

### 4.1 Kiến trúc tổng thể

Hệ thống theo mô hình **Client-Server truyền thống với REST API**, bao gồm hai thành phần tách biệt:

```
CLIENT TIER
  Next.js 16 (React 19, TypeScript)
  Port: 3000 | Thư mục: frontend-new/
        |
        | HTTP REST API (localhost:5000)
        v
SERVER TIER
  Express.js 5 + Node.js
  Port: 5000 | Thư mục: backend/
  [ Routes ] [ Controllers ] [ Services ]
        |
        | Mongoose ODM
        v
DATA TIER
  MongoDB (local hoặc MongoDB Atlas)
  7 Collections: User, Video, Vocabulary, Category, Post, Comment, FriendRequest
```

**Các dịch vụ bên ngoài:**

- **Google Gemini AI API** — Phiên âm audio và tạo gợi ý tìm kiếm
- **Deepgram API** — Dự phòng phiên âm audio
- **Google OAuth 2.0** — Xác thực đăng nhập Google
- **YouTube oEmbed API** — Lấy metadata video (không cần API key)
- **YouTube Caption API** — Lấy phụ đề tự động của video YouTube
- **Free Dictionary API / Wiktionary / Google Translate** — Tra từ điển
- **Gmail SMTP** — Gửi email thông báo và nhắc nhở

### 4.2 Kiến trúc Frontend

Frontend sử dụng **Next.js App Router** với mô hình **Client Components** là chủ đạo ("use client"):

```
frontend-new/
  app/
    layout.tsx              <- Root layout (ThemeProvider, GoogleProvider, LanguageProvider)
    (marketing)/            <- Route group: Landing page (không có auth guard)
    auth/                   <- Trang đăng nhập/đăng ký
    onboarding/             <- Khảo sát sau đăng ký lần đầu
    checkout/               <- Thanh toán nâng cấp Pro
    dashboard/              <- Khu vực chính (bảo vệ bởi AuthGuard)
      layout.tsx            <- Dashboard layout: Sidebar + main content
      page.tsx              <- Trang chủ dashboard
      practice/[videoId]/   <- Luyện tập YouTube video
      practice/local/[id]/  <- Luyện tập video tải lên
      my-video/             <- Thư viện video cá nhân
      collections/[id]/     <- Bộ sưu tập theo chủ đề
      vocabulary/           <- Quản lý từ vựng
      feed/                 <- Bảng tin cộng đồng
      friends/              <- Quản lý bạn bè
      notifications/        <- Thông báo
      profile/[userId]/     <- Hồ sơ người dùng
      upgrade/              <- Nâng cấp tài khoản Pro
  components/
    auth/                   <- AuthGuard, GoogleProvider, Forms
    dashboard/              <- Header, UrlInput, Recommendations...
    layout/                 <- Sidebar, Navbar, Footer
    landingpage/            <- Hero, Features, Pricing
    my-video/               <- VideoToolbar
    ui/                     <- Button, Card, Input (Radix-based)
```

**Quản lý trạng thái:** Không sử dụng thư viện state management tập trung. Trạng thái được quản lý cục bộ bằng React useState/useEffect. Dữ liệu người dùng (token, user object) lưu trong localStorage.

**Đa ngôn ngữ:** Tự triển khai bằng lib/i18n.tsx, hỗ trợ tiếng Anh (en) và tiếng Việt (vi).

### 4.3 Kiến trúc Backend

Backend theo mô hình **MVC (Model-View-Controller)** thuần:

```
backend/src/
  server.js          <- Entry point: khởi tạo Express, kết nối DB, đăng ký routes
  routes/            <- Định nghĩa endpoints, áp dụng middleware
  controllers/       <- Business logic, xử lý request/response
  models/            <- Mongoose schemas (định nghĩa cấu trúc database)
  middleware/        <- authMiddleware (xác thực JWT)
  services/          <- emailService, reminderScheduler (logic độc lập)
```

### 4.4 Luồng dữ liệu — Xác thực

```
1. Người dùng gửi credentials (email+password hoặc Google token)
2. authController.js kiểm tra DB -> tạo JWT (7 ngày)
3. Frontend nhận token -> lưu vào localStorage
4. Mọi request sau đó gửi kèm header: Authorization: Bearer <token>
5. authMiddleware.js xác minh token -> gắn req.userId -> next()
```

### 4.5 Luồng xử lý video YouTube

```
1. Người dùng nhập URL YouTube vào UrlInput component
2. Frontend lấy metadata qua YouTube oEmbed API (không cần API key)
3. Người dùng lưu video -> POST /api/saved-video
4. Backend lưu record vào collection Video
5. Background job tự động fetch transcript từ YouTube Caption API
6. Khi luyện tập: GET /api/video/transcript/:youtubeId
7. Frontend phát video qua YouTube IFrame API + hiển thị transcript đồng bộ
```

### 4.6 Luồng xử lý video tải lên

```
1. Người dùng chọn file video (<=500MB) qua UploadVideoCard component
2. Frontend gửi multipart/form-data -> POST /api/video/upload
3. Multer lưu file vào uploads/videos/
4. ffmpeg trích xuất audio (libmp3lame 128kbps) -> uploads/audio/
5. ffmpeg trích xuất thumbnail (frame tại giây 1) -> uploads/thumbnails/
6. Gemini AI nhận audio -> phiên âm -> trả transcript với timestamp
   (fallback: Deepgram API nếu Gemini thất bại)
7. Video record được lưu vào MongoDB với transcript đầy đủ
8. File audio tạm thời bị xóa
9. Frontend redirect đến trang luyện tập /dashboard/practice/local/:id
```

### 4.7 Luồng gợi ý video AI

```
1. Người dùng mở Dashboard
2. VideoRecommendations component gọi GET /api/recommendations
3. Backend đọc survey từ hồ sơ người dùng
4. Gemini AI tạo N cụm từ tìm kiếm YouTube phù hợp với hồ sơ
5. yt-search tìm kiếm video YouTube theo từng cụm từ (song song)
6. Kết quả được loại trùng và trả về danh sách video
7. Nếu không có survey hoặc AI lỗi: dùng fallback query cứng
```

---

## 5. CẤU TRÚC THƯ MỤC DỰ ÁN

```
smart-video/                    <- Thư mục gốc monorepo
  backend/                      <- Backend Node.js/Express
    .env                        <- Biến môi trường thực tế (không commit)
    .env.example                <- Template biến môi trường
    package.json                <- Dependencies backend
    src/
      server.js                 [QUAN TRỌNG] Entry point
      controllers/
        authController.js       [QUAN TRỌNG] Đăng ký, đăng nhập, Google OAuth, profile
        videoController.js      [QUAN TRỌNG] Stream/download/upload video, AI transcription
        savedVideoController.js [QUAN TRỌNG] Thư viện video, tiến trình học
        transcriptController.js [QUAN TRỌNG] Lấy/cache transcript YouTube
        vocabularyController.js [QUAN TRỌNG] CRUD từ vựng cá nhân
        categoryController.js   Quản lý bộ sưu tập/chủ đề
        dictionaryController.js Tra từ điển (multi-source với cache)
        recommendController.js  [QUAN TRỌNG] Gợi ý video bằng AI
        postController.js       [QUAN TRỌNG] Bảng tin, like, share
        commentController.js    Bình luận bài đăng
        friendController.js     Kết bạn, lời mời, gợi ý bạn bè
      middleware/
        authMiddleware.js       [QUAN TRỌNG] Xác thực JWT Bearer token
      models/
        User.js                 [QUAN TRỌNG] Schema người dùng (phức tạp nhất)
        Video.js                [QUAN TRỌNG] Schema video (YouTube + local)
        Vocabulary.js           Schema từ vựng cá nhân
        Category.js             Schema bộ sưu tập
        Post.js                 Schema bài đăng cộng đồng
        Comment.js              Schema bình luận
        FriendRequest.js        Schema lời mời kết bạn
      routes/                   <- Khai báo 10 nhóm endpoints
      services/
        emailService.js         [QUAN TRỌNG] Gửi email HTML qua Gmail SMTP
        reminderScheduler.js    [QUAN TRỌNG] Cron job 10:00 SA gửi nhắc nhở
    uploads/
      videos/                   <- Video gốc tải lên
      audio/                    <- Audio tạm thời cho transcription (tự xóa)
      thumbnails/               <- Thumbnail trích xuất từ video
      avatars/                  <- Ảnh đại diện người dùng

  frontend-new/                 <- Frontend Next.js (phiên bản đang dùng)
    .env.local                  <- Biến môi trường frontend thực tế
    .env.local.example          <- Template: chỉ NEXT_PUBLIC_GOOGLE_CLIENT_ID
    next.config.ts              [QUAN TRỌNG] Cấu hình CSP header cho YouTube iframe
    tailwind.config.ts          <- Cấu hình Tailwind v4
    tsconfig.json               <- Cấu hình TypeScript
    app/
      layout.tsx                [QUAN TRỌNG] Root layout
      globals.css               <- Global CSS styles
      (marketing)/              <- Landing page (route group)
      auth/                     <- Trang đăng nhập/đăng ký
      onboarding/               <- Khảo sát ban đầu (5 bước)
      checkout/                 <- Trang thanh toán Pro
      dashboard/                <- Toàn bộ tính năng chính
    components/                 <- Reusable components
    lib/
      i18n.tsx                  [QUAN TRỌNG] Context + translations EN/VI
      utils.ts                  <- Tiện ích (clsx, twMerge)

  frontend/                     <- Phiên bản frontend cũ (không dùng nữa)
  README.md                     <- Nội dung rỗng (chỉ có tiêu đề)
```

---

## 6. PHÂN TÍCH CHỨC NĂNG

### 6.1 Xác thực (Authentication)

#### Mục đích

Cho phép người dùng đăng ký, đăng nhập bằng email/mật khẩu hoặc tài khoản Google, quản lý phiên đăng nhập.

#### Luồng xử lý — Đăng ký email

1. Người dùng điền form (sign-up-form.tsx) -> POST /api/auth/register
2. authController.register kiểm tra trùng email/username
3. bcryptjs băm mật khẩu với salt 10 vòng
4. Lưu User vào MongoDB -> trả JWT token (7 ngày)
5. Frontend lưu token + user vào localStorage
6. Redirect đến /onboarding

#### Luồng xử lý — Đăng nhập Google (Implicit Flow)

1. Frontend dùng useGoogleLogin từ @react-oauth/google
2. Lấy access_token -> fetch userinfo từ Google OAuth server
3. Gửi userInfo lên POST /api/auth/google
4. authController.googleAuth tìm user theo email hoặc googleId
5. Nếu user mới: tạo tài khoản + gửi email chào mừng
6. Nếu user cũ: cập nhật avatar
7. Trả JWT token

**Thành phần liên quan:**

- frontend-new/components/auth/sign-in-form.tsx
- frontend-new/components/auth/sign-up-form.tsx
- frontend-new/components/auth/auth-guard.tsx
- backend/src/controllers/authController.js
- backend/src/models/User.js

---

### 6.2 Onboarding — Khảo sát đầu vào

#### Mục đích

Thu thập thông tin học tập của người dùng mới để cá nhân hóa gợi ý video AI.

#### Luồng xử lý

Form 5 bước tại frontend-new/app/onboarding/page.tsx:

- Bước 1: Trình độ tiếng Anh (5 cấp: beginner, elementary, intermediate, upper-intermediate, advanced)
- Bước 2: Mục tiêu học (10 lựa chọn: giao tiếp, IELTS, TOEIC, listening, pronunciation, travel, job, IT, office, academic)
- Bước 3: Sở thích (12 chủ đề: âm nhạc, thể thao, công nghệ, phim, ẩm thực, du lịch, game, tin tức, kinh doanh, khoa học, thời trang, sức khoẻ)
- Bước 4: Phong cách học (8 loại: short-video, podcast, movie, series, documentary, music, news-video, talk-show)
- Bước 5: Thời gian học mỗi ngày (7 lựa chọn từ 10 phút đến 2 giờ+)

Submit -> POST /api/auth/survey -> lưu user.survey + onboardingCompleted = true

---

### 6.3 Lưu và Quản lý Video YouTube

#### Mục đích

Cho phép người dùng lưu video YouTube vào thư viện cá nhân để luyện tập sau.

#### Luồng xử lý

1. Người dùng nhập URL YouTube vào UrlInput component
2. Frontend trích xuất youtubeId (11 ký tự) từ URL
3. Gọi YouTube oEmbed API để lấy title và thumbnail
4. Hiển thị SaveVideoModal để chọn yêu thích và bộ sưu tập
5. POST /api/saved-video -> lưu vào collection Video
6. Background: tự động fetch và cache transcript YouTube

**Thành phần liên quan:**

- frontend-new/components/dashboard/url-input.tsx
- frontend-new/components/dashboard/save-video-modal.tsx
- backend/src/controllers/savedVideoController.js
- backend/src/controllers/transcriptController.js

---

### 6.4 Tải lên Video và Transcription AI

#### Mục đích

Upload video từ máy tính. AI tự động phiên âm nội dung thành transcript có timestamp.

#### Luồng xử lý

1. Người dùng kéo thả hoặc chọn file video qua UploadVideoCard
2. XHR upload với tracking tiến trình (progress bar)
3. POST /api/video/upload (multipart/form-data, giới hạn 500MB)
4. Multer lưu file -> ffmpeg trích xuất audio MP3 128kbps
5. ffmpeg trích xuất thumbnail tại giây thứ 1
6. Gemini AI (gemini-2.0-flash -> 1.5-flash -> 1.5-flash-8b):
   - Upload audio lên Google AI File Manager
   - Prompt yêu cầu format: M:SS sentence text
   - Parse kết quả thành mảng {time, text}
7. Nếu Gemini thất bại -> Deepgram API (nova-3, utterances=true)
8. Lưu Video + transcript vào MongoDB
9. Xóa file audio tạm thời
10. Frontend redirect đến /dashboard/practice/local/:id

**Thành phần liên quan:**

- frontend-new/components/dashboard/upload-video-card.tsx
- backend/src/controllers/videoController.js

---

### 6.5 Luyện tập Video (Practice)

#### Mục đích

Giao diện luyện nghe tương tác với transcript đồng bộ theo thời gian video.

#### Đặc điểm UI

- Panel trái: Transcript với progress bar, auto-scroll theo video
- Panel giữa: YouTube IFrame player hoặc HTML5 video player
- Panel phải: Tra từ điển, lưu từ vựng, chia sẻ lên feed

#### Luồng xử lý

1. Load YouTube IFrame API (window.YT)
2. Fetch transcript: GET /api/video/transcript/:youtubeId
3. setInterval track thời gian hiện tại của player
4. So sánh currentTime với mảng transcript để highlight đoạn đang phát
5. Người dùng click tra từ -> fetch /api/dictionary?word=...
6. Popup từ điển hiện phonetic, definition, dịch tiếng Việt
7. Người dùng click "Lưu từ" -> POST /api/vocabulary
8. Ghi nhận tiến trình: POST /api/saved-video/:youtubeId/practice

**Thành phần liên quan:**

- frontend-new/app/dashboard/practice/[videoId]/page.tsx
- frontend-new/app/dashboard/practice/local/[id]/page.tsx
- backend/src/controllers/transcriptController.js
- backend/src/controllers/dictionaryController.js
- backend/src/controllers/savedVideoController.js

---

### 6.6 Gợi ý Video AI

#### Mục đích

Đề xuất video YouTube học tiếng Anh phù hợp với hồ sơ và trình độ từng người dùng.

#### Luồng xử lý

1. Dashboard load -> GET /api/recommendations?limit=8 (Free) hoặc ?limit=20 (Pro)
2. Backend đọc user.survey từ MongoDB
3. Gemini AI tạo N cụm từ tìm kiếm YouTube bằng tiếng Anh
4. yt-search tìm kiếm song song cho từng query
5. Kết quả deduplicate -> trả về danh sách video
6. Pro users: tìm kiếm tự do qua GET /api/recommendations/search?q=...

**Thành phần liên quan:**

- frontend-new/components/dashboard/video-recommendations.tsx
- backend/src/controllers/recommendController.js

---

### 6.7 Quản lý Từ vựng

#### Đặc điểm

- Từ vựng có hai nguồn: từ luyện tập video (source: "vocabulary") và từ bộ sưu tập (source: "collection")
- Nhóm từ vựng theo video nguồn để dễ ôn tập
- Đánh dấu đã học (learned: true), yêu thích (isFavorite: true)
- Phát âm qua Web Speech API (window.speechSynthesis)
- Xem lại đoạn video tương ứng qua YouTube IFrame popup
- Tab lọc: Tất cả, Chưa học, Đã học, Yêu thích
- Chia sẻ từ vựng lên Feed dưới dạng vocab post

**Thành phần liên quan:**

- frontend-new/app/dashboard/vocabulary/page.tsx
- backend/src/controllers/vocabularyController.js
- backend/src/models/Vocabulary.js

---

### 6.8 Tra từ điển (Dictionary)

#### Luồng xử lý

1. Người dùng click vào từ trong transcript
2. GET /api/dictionary?word=<word>
3. Backend kiểm tra in-memory cache (TTL 24h, sử dụng Map)
4. Nếu miss: gọi song song Free Dictionary API + Google Translate API
5. Fallback: Wiktionary nếu Free Dictionary thất bại
6. Trả về: { phonetic, dictMeanings, translation }
7. Cache kết quả

**Thành phần liên quan:**

- backend/src/controllers/dictionaryController.js

---

### 6.9 Bảng tin cộng đồng (Social Feed)

#### Loại bài đăng

- **Video Post**: Chia sẻ video YouTube đã lưu/thực hành/yêu thích
- **Vocab Post**: Chia sẻ danh sách từ vựng đã học

#### Quy tắc hiển thị

- visibility: "public" -> hiển thị cho tất cả
- visibility: "friends" -> chỉ hiển thị cho bạn bè có status: "accepted"
- Hỗ trợ phân trang (10 bài/trang mặc định)

#### Tính năng tương tác

- Like/Unlike bài đăng
- Bình luận (tối đa 500 ký tự)
- Lưu/yêu thích video từ bài đăng
- Import từ vựng từ vocab post (tránh trùng lặp tự động)

**Thành phần liên quan:**

- frontend-new/app/dashboard/feed/page.tsx
- backend/src/controllers/postController.js
- backend/src/controllers/commentController.js
- backend/src/models/Post.js

---

### 6.10 Hệ thống Bạn bè

#### Luồng xử lý

- Gợi ý: Trả về người dùng đăng ký gần đây chưa có quan hệ với mình
- Gửi lời mời: Tạo FriendRequest với status "pending"
- Chấp nhận: Cập nhật status -> "accepted"
- Từ chối: Xóa record FriendRequest
- Hủy kết bạn: Xóa record với status "accepted"
- Index unique (sender, receiver): Ngăn gửi trùng lời mời

**Thành phần liên quan:**

- frontend-new/app/dashboard/friends/page.tsx
- frontend-new/app/dashboard/notifications/page.tsx
- backend/src/controllers/friendController.js
- backend/src/models/FriendRequest.js

---

### 6.11 Theo dõi Tiến trình & Streak

#### Cơ chế streak (backend/src/controllers/savedVideoController.js)

```
today    = new Date().toISOString().slice(0, 10)
yesterday= new Date(now - 86400000).toISOString().slice(0, 10)

if (last_study_date === today)        -> streak không đổi
if (last_study_date === yesterday)    -> streak += 1
else                                  -> streak = 1 (gián đoạn)
```

#### Nhắc nhở email (backend/src/services/reminderScheduler.js)

- Cron job lịch "0 10 \* \* \*" timezone "Asia/Ho_Chi_Minh" = 10:00 AM mỗi ngày
- Tìm tất cả user có streakReminderEnabled: true
- Gửi email HTML nhắc nhở duy trì streak tuần tự

---

### 6.12 Nâng cấp Pro

#### Chi tiết gói

| Gói        | Giá               | Tiết kiệm |
| ---------- | ----------------- | --------- |
| Hàng tuần  | 49.000 VND/tuần   | —         |
| Hàng tháng | 149.000 VND/tháng | 25%       |
| Hàng năm   | 999.000 VND/năm   | 57%       |

Phương thức thanh toán: Thẻ tín dụng và chuyển khoản 37 ngân hàng Việt Nam (UI only, không tích hợp payment gateway thực tế).

**Lưu ý quan trọng:** Endpoint POST /api/auth/upgrade cho phép tự kích hoạt Pro mà không xác minh thanh toán. Đây là lỗ hổng nghiêm trọng cần xử lý trước khi production.

**Thành phần liên quan:**

- frontend-new/app/checkout/page.tsx
- frontend-new/app/dashboard/upgrade/page.tsx
- backend/src/controllers/authController.js (upgradeToPremium, downgradePremium)

---

## 7. PHÂN TÍCH FRONTEND

### 7.1 Routing

Next.js App Router (Next.js 16):

- Route groups: (marketing) không có layout dashboard, không có auth guard
- Dynamic routes: [videoId], [id], [userId]
- Tất cả routes dưới /dashboard bảo vệ bởi AuthGuard component

### 7.2 Pages và trách nhiệm

| Trang             | Đường dẫn                     | Mô tả                                         |
| ----------------- | ----------------------------- | --------------------------------------------- |
| Landing           | /                             | Marketing: Hero, Features, Pricing            |
| Sign In           | /auth/signin                  | Đăng nhập email + Google                      |
| Sign Up           | /auth/signup                  | Đăng ký tài khoản mới                         |
| Onboarding        | /onboarding                   | Khảo sát 5 bước sau đăng ký                   |
| Dashboard         | /dashboard                    | Trang chủ: URL input, upload, recommendations |
| Practice (YT)     | /dashboard/practice/:videoId  | Luyện tập video YouTube                       |
| Practice (Local)  | /dashboard/practice/local/:id | Luyện tập video đã tải lên                    |
| My Video          | /dashboard/my-video           | Thư viện video cá nhân                        |
| Collections       | /dashboard/collections        | Quản lý bộ sưu tập                            |
| Collection Detail | /dashboard/collections/:id    | Chi tiết một bộ sưu tập                       |
| Vocabulary        | /dashboard/vocabulary         | Quản lý từ vựng                               |
| Feed              | /dashboard/feed               | Bảng tin cộng đồng                            |
| Friends           | /dashboard/friends            | Quản lý bạn bè                                |
| Notifications     | /dashboard/notifications      | Thông báo: lời mời kết bạn, bài đăng          |
| Profile           | /dashboard/profile            | Hồ sơ cá nhân + cài đặt                       |
| Public Profile    | /dashboard/profile/:userId    | Hồ sơ công khai người dùng khác               |
| Upgrade           | /dashboard/upgrade            | Nâng cấp Pro                                  |
| Checkout          | /checkout                     | Thanh toán                                    |

### 7.3 Quản lý trạng thái

- Không sử dụng thư viện state management toàn cục (Redux, Zustand)
- Trạng thái cục bộ: React useState + useEffect
- Dữ liệu phiên đăng nhập: localStorage (key: "token", "user", "smartvideo_pro_plan")
- Ngôn ngữ: React Context (LanguageProvider trong lib/i18n.tsx) + localStorage
- Theme: next-themes library với ThemeProvider

### 7.4 Gọi API

- Không sử dụng Axios trong hầu hết components mặc dù đã cài đặt
- Toàn bộ API call dùng native fetch()
- URL API hardcode: http://localhost:5000/api (không dùng biến môi trường)
- Không có HTTP interceptor tập trung

### 7.5 Xử lý form

- Dùng useRef để đọc giá trị form (không dùng useState cho từng trường)
- Không sử dụng thư viện form (React Hook Form, Formik)
- Validation cơ bản: kiểm tra required, độ dài tối thiểu

### 7.6 Xử lý lỗi

- Toast notifications qua sonner library
- State error: string | null cục bộ trong mỗi component
- Không có Error Boundary toàn cục

### 7.7 Internationalization (i18n)

- Tự triển khai hoàn toàn, không dùng thư viện (i18next, next-intl)
- File: frontend-new/lib/i18n.tsx
- Hỗ trợ: Tiếng Anh (en) và Tiếng Việt (vi)
- Tất cả chuỗi dịch nằm trong object translations trong cùng file

### 7.8 Đặc điểm thiết kế UI

- Color scheme tối: nền gradient từ #2D1B4E đến #1C1642 (purple dark)
- Màu nhấn: #00E5FF (cyan), #7C3AED (violet)
- Layout: Flexbox, sidebar cố định bên trái
- Animation: Framer Motion cho Landing page và Onboarding

---

## 8. PHÂN TÍCH BACKEND

### 8.1 Controllers và trách nhiệm

| Controller           | File                                    | Chức năng chính                                                                     |
| -------------------- | --------------------------------------- | ----------------------------------------------------------------------------------- |
| authController       | src/controllers/authController.js       | Đăng ký, đăng nhập, Google OAuth, profile, avatar, survey, premium, streak reminder |
| videoController      | src/controllers/videoController.js      | Stream/download YouTube, upload video local, AI transcription (Gemini + Deepgram)   |
| savedVideoController | src/controllers/savedVideoController.js | CRUD thư viện video, toggle favorite, ghi nhận practice, lưu tiến trình xem         |
| transcriptController | src/controllers/transcriptController.js | Lấy transcript YouTube (cache DB), fetch background                                 |
| vocabularyController | src/controllers/vocabularyController.js | CRUD từ vựng, lọc theo nguồn/category                                               |
| categoryController   | src/controllers/categoryController.js   | CRUD bộ sưu tập/chủ đề                                                              |
| dictionaryController | src/controllers/dictionaryController.js | Tra từ điển multi-source với in-memory cache 24h                                    |
| recommendController  | src/controllers/recommendController.js  | Gợi ý video AI (Gemini + yt-search), tìm kiếm theo keyword                          |
| postController       | src/controllers/postController.js       | Bảng tin: tạo bài, feed, like, save/import từ bài đăng                              |
| commentController    | src/controllers/commentController.js    | CRUD bình luận, đồng bộ commentsCount trên Post                                     |
| friendController     | src/controllers/friendController.js     | Gợi ý bạn bè, lời mời kết bạn, danh sách bạn bè                                     |

### 8.2 Middleware

**authMiddleware** (src/middleware/authMiddleware.js):

- Kiểm tra header Authorization: Bearer <token>
- Xác minh JWT với process.env.JWT_SECRET
- Gắn req.userId (decoded từ token)
- Trả 401 nếu thiếu hoặc token không hợp lệ

**Không có middleware** cho: rate limiting, request logging, input sanitization toàn cục, error handling tập trung.

### 8.3 Services

**emailService** (src/services/emailService.js):

- Nodemailer transporter với Gmail SMTP
- sendWelcomeEmail — HTML email chào mừng sau đăng ký Google
- sendLoginNotificationEmail — Thông báo đăng nhập mới
- sendStreakReminderEmail — Nhắc nhở duy trì streak

**reminderScheduler** (src/services/reminderScheduler.js):

- node-cron với lịch "0 10 \* \* \*" timezone "Asia/Ho_Chi_Minh"
- Tìm tất cả user có streakReminderEnabled: true -> gửi email tuần tự
- Khởi động tại server.js: startReminderScheduler()

### 8.4 Business Logic đặc biệt

**Feed phân quyền** (postController.getFeed):

```
query = {
  $or: [
    { visibility: "public" },        // bài công khai
    { sharedWith: me },              // bài chia sẻ trực tiếp cho tôi
    { userId: me },                  // bài của chính tôi
    { visibility: "friends", userId: { $in: friendIds } }, // bài bạn bè
  ]
}
```

**Tránh trùng lặp từ vựng** (postController.saveVocabFromPost):

- Kiểm tra tập hợp từ đã có -> chỉ insert từ chưa có trong danh sách

**Tiến trình xem video** (savedVideoController.saveProgress):

- progressPercent = (progressTime / duration) \* 100
- isCompleted = progressPercent >= 95

---

## 9. PHÂN TÍCH DATABASE

### 9.1 Collections trong MongoDB

| Collection    | Mục đích                       | Trường quan trọng                                                                                                                                                  | Quan hệ                                                      |
| ------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| User          | Thông tin người dùng           | username, email, password_hash, googleId, authProvider, is_premium, study_streak, last_study_date, survey, onboardingCompleted, streakReminderEnabled, premiumPlan | Được tham chiếu bởi tất cả collections khác                  |
| Video         | Video YouTube và video tải lên | userId, youtubeId, isLocal, localFilename, title, thumbnail, transcript[], progressTime, progressPercent, isCompleted, lastPracticed, categoryId                   | userId->User, categoryId->Category                           |
| Vocabulary    | Từ vựng cá nhân                | userId, word, phonetic, translation, example, videoId, videoTitle, learned, isFavorite, categoryId, source                                                         | userId->User, categoryId->Category                           |
| Category      | Bộ sưu tập/chủ đề              | userId, name, color                                                                                                                                                | userId->User, tham chiếu bởi Video và Vocabulary             |
| Post          | Bài đăng cộng đồng             | userId, postType (video/vocab), caption, youtubeId, vocabWords[], visibility, likes[], commentsCount                                                               | userId->User, likes[]->User                                  |
| Comment       | Bình luận bài đăng             | postId, userId, text (max 500 ký tự)                                                                                                                               | postId->Post, userId->User                                   |
| FriendRequest | Lời mời kết bạn                | sender, receiver, status (pending/accepted/declined)                                                                                                               | sender->User, receiver->User, unique index (sender,receiver) |

### 9.2 Chi tiết Schema User (src/models/User.js)

Trường phức tạp nhất với các nhóm:

- Xác thực: username, email, password_hash, googleId, authProvider
- Hồ sơ: fullname, avatar (mặc định DiceBear SVG)
- Học tập: total_points, total_study_time, study_streak, last_study_date
- Premium: is_premium, premiumPlan { planId, label, price, unit, activatedAt }
- Onboarding: onboardingCompleted, survey { age, englishLevel, goals[], interests[], learningStyle[], studyTimeMinutes }
- Cài đặt: streakReminderEnabled

### 9.3 Quan hệ giữa Collections

```
User --< Video           (1:N - một user có nhiều video)
User --< Vocabulary      (1:N - một user có nhiều từ vựng)
User --< Category        (1:N - một user có nhiều bộ sưu tập)
User --< Post            (1:N - một user có nhiều bài đăng)
Category --< Video       (1:N - một chủ đề có nhiều video)
Category --< Vocabulary  (1:N - một chủ đề có nhiều từ vựng)
Post --< Comment         (1:N - một bài đăng có nhiều bình luận)
User >--< User           (N:N - kết bạn qua FriendRequest)
```

### 9.4 Indexes đặc biệt

- User.googleId: sparse: true (cho phép null, không trùng)
- Vocabulary.userId: index thường để tăng tốc truy vấn
- FriendRequest.(sender, receiver): unique compound index

---

## 10. PHÂN TÍCH API

### 10.1 Auth Routes — /api/auth

| Endpoint                | Method     | Chức năng                            | Xác thực |
| ----------------------- | ---------- | ------------------------------------ | -------- |
| /api/auth/register      | POST       | Đăng ký email/password               | Không    |
| /api/auth/login         | POST       | Đăng nhập email/password             | Không    |
| /api/auth/google        | POST       | Đăng nhập/đăng ký qua Google OAuth   | Không    |
| /api/auth/me            | GET        | Lấy thông tin người dùng hiện tại    | JWT      |
| /api/auth/stats         | GET        | Lấy thống kê học tập                 | JWT      |
| /api/auth/profile       | PATCH      | Cập nhật fullname và email           | JWT      |
| /api/auth/password      | PATCH      | Đổi mật khẩu                         | JWT      |
| /api/auth/avatar        | POST       | Upload ảnh đại diện (multipart, 5MB) | JWT      |
| /api/auth/survey        | POST/PATCH | Lưu kết quả onboarding survey        | JWT      |
| /api/auth/notifications | PATCH      | Bật/tắt nhắc nhở streak email        | JWT      |
| /api/auth/test-reminder | POST       | Gửi email nhắc nhở ngay để test      | JWT      |
| /api/auth/upgrade       | POST       | Kích hoạt gói Premium                | JWT      |
| /api/auth/downgrade     | POST       | Hủy gói Premium                      | JWT      |
| /api/auth/users/:userId | GET        | Lấy hồ sơ công khai của người dùng   | JWT      |

### 10.2 Video Routes — /api/video

| Endpoint                         | Method | Chức năng                              | Xác thực |
| -------------------------------- | ------ | -------------------------------------- | -------- |
| /api/video/stream                | GET    | Stream video YouTube trực tiếp         | Không    |
| /api/video/download              | POST   | Tải video YouTube xuống server         | Không    |
| /api/video/transcript/:youtubeId | GET    | Lấy transcript (cache-first)           | Không    |
| /api/video/upload                | POST   | Upload video local + AI transcription  | JWT      |
| /api/video/local/:id             | GET    | Lấy thông tin video local + transcript | Không    |
| /api/video/local/:id/thumbnail   | POST   | Tạo thumbnail cho video local          | JWT      |

### 10.3 Saved Video Routes — /api/saved-video

| Endpoint                                 | Method | Chức năng                                        | Xác thực |
| ---------------------------------------- | ------ | ------------------------------------------------ | -------- |
| /api/saved-video                         | POST   | Lưu video YouTube vào thư viện                   | JWT      |
| /api/saved-video                         | GET    | Lấy danh sách video (filter: category, favorite) | JWT      |
| /api/saved-video/history                 | GET    | Lịch sử xem video                                | JWT      |
| /api/saved-video/:id/favorite            | PATCH  | Toggle yêu thích                                 | JWT      |
| /api/saved-video/:id/category            | PATCH  | Gán chủ đề cho video                             | JWT      |
| /api/saved-video/:id                     | DELETE | Xóa video khỏi thư viện                          | JWT      |
| /api/saved-video/:youtubeId/practice     | POST   | Ghi nhận đã luyện tập (cập nhật streak)          | JWT      |
| /api/saved-video/:id/local-practice      | POST   | Ghi nhận luyện tập video local                   | JWT      |
| /api/saved-video/:youtubeId/progress     | PATCH  | Lưu tiến trình xem                               | JWT      |
| /api/saved-video/:id/local-progress      | PATCH  | Lưu tiến trình video local                       | JWT      |
| /api/saved-video/:youtubeId/progress-get | GET    | Lấy tiến trình xem hiện tại                      | JWT      |

### 10.4 Vocabulary Routes — /api/vocabulary

| Endpoint            | Method | Chức năng                                          | Xác thực               |
| ------------------- | ------ | -------------------------------------------------- | ---------------------- |
| /api/vocabulary     | POST   | Thêm từ vựng mới                                   | JWT (trong controller) |
| /api/vocabulary     | GET    | Lấy danh sách từ vựng (filter: source, categoryId) | JWT (trong controller) |
| /api/vocabulary/:id | PATCH  | Cập nhật từ vựng                                   | JWT (trong controller) |
| /api/vocabulary/:id | DELETE | Xóa từ vựng                                        | JWT (trong controller) |

### 10.5 Category Routes — /api/category

| Endpoint          | Method | Chức năng                     | Xác thực |
| ----------------- | ------ | ----------------------------- | -------- |
| /api/category     | GET    | Lấy danh sách chủ đề của user | JWT      |
| /api/category     | POST   | Tạo chủ đề mới                | JWT      |
| /api/category/:id | PATCH  | Cập nhật chủ đề               | JWT      |
| /api/category/:id | DELETE | Xóa chủ đề                    | JWT      |

### 10.6 Dictionary Routes — /api/dictionary

| Endpoint        | Method | Chức năng                  | Xác thực |
| --------------- | ------ | -------------------------- | -------- |
| /api/dictionary | GET    | Tra nghĩa từ vựng (?word=) | Không    |

### 10.7 Recommendation Routes — /api/recommendations

| Endpoint                    | Method | Chức năng                    | Xác thực |
| --------------------------- | ------ | ---------------------------- | -------- |
| /api/recommendations        | GET    | Gợi ý video AI (?limit=)     | JWT      |
| /api/recommendations/search | GET    | Tìm kiếm video YouTube (?q=) | JWT      |

### 10.8 Post Routes — /api/posts

| Endpoint                      | Method | Chức năng                      | Xác thực |
| ----------------------------- | ------ | ------------------------------ | -------- |
| /api/posts                    | GET    | Lấy feed bài đăng (pagination) | JWT      |
| /api/posts/liked              | GET    | Bài đăng đã like               | JWT      |
| /api/posts/friends-recent     | GET    | Bài đăng gần đây từ bạn bè     | JWT      |
| /api/posts                    | POST   | Tạo bài đăng video             | JWT      |
| /api/posts/vocab              | POST   | Tạo bài đăng từ vựng           | JWT      |
| /api/posts/:id                | DELETE | Xóa bài đăng                   | JWT      |
| /api/posts/:id/like           | POST   | Toggle like/unlike             | JWT      |
| /api/posts/:id/save           | POST   | Lưu video từ bài đăng          | JWT      |
| /api/posts/:id/favorite-video | POST   | Yêu thích video từ bài đăng    | JWT      |
| /api/posts/:id/save-vocab     | POST   | Import từ vựng từ bài đăng     | JWT      |
| /api/posts/:postId/comments   | GET    | Lấy danh sách bình luận        | JWT      |
| /api/posts/:postId/comments   | POST   | Thêm bình luận                 | JWT      |

### 10.9 Friend Routes — /api/friends

| Endpoint                                | Method | Chức năng                   | Xác thực |
| --------------------------------------- | ------ | --------------------------- | -------- |
| /api/friends/suggestions                | GET    | Gợi ý bạn bè mới            | JWT      |
| /api/friends/requests                   | GET    | Danh sách lời mời nhận được | JWT      |
| /api/friends/list                       | GET    | Danh sách bạn bè đã kết nối | JWT      |
| /api/friends/request/:userId            | POST   | Gửi lời mời kết bạn         | JWT      |
| /api/friends/request/:requestId/accept  | PATCH  | Chấp nhận lời mời           | JWT      |
| /api/friends/request/:requestId/decline | PATCH  | Từ chối lời mời             | JWT      |
| /api/friends/:userId                    | DELETE | Hủy kết bạn                 | JWT      |

---

## 11. PHÂN TÍCH AI VÀ VIDEO PROCESSING

### 11.1 AI Models được sử dụng

| AI/Service                 | Mục đích                       | File                   | Ghi chú          |
| -------------------------- | ------------------------------ | ---------------------- | ---------------- |
| Google Gemini 2.0 Flash    | Phiên âm audio (thử đầu tiên)  | videoController.js     | Nhanh nhất       |
| Google Gemini 1.5 Flash    | Phiên âm audio (fallback 1)    | videoController.js     | Dự phòng         |
| Google Gemini 1.5 Flash 8B | Phiên âm audio (fallback 2)    | videoController.js     | Nhẹ nhất         |
| Deepgram nova-3            | Phiên âm audio (fallback cuối) | videoController.js     | Free $200 credit |
| Google Gemini 2.0 Flash    | Tạo search queries gợi ý video | recommendController.js | Dùng NLP         |

### 11.2 Prompt Engineering — Transcription

File: backend/src/controllers/videoController.js

```
PROMPT = "Transcribe this audio. Output ONLY lines in this exact format:
M:SS sentence text here
where M:SS is the start time. Split into natural sentences of 5-15 words.
No headers, no explanation, just the timestamped lines."
```

Parse bằng regex: /^(\d+:\d{2})\s+(.+)$/

### 11.3 Prompt Engineering — Video Recommendations

File: backend/src/controllers/recommendController.js

Gemini nhận: trình độ, mục tiêu, sở thích, phong cách học, thời gian học/ngày
Output: JSON array N cụm từ tìm kiếm YouTube tiếng Anh đa dạng, phù hợp trình độ
Fallback: rule-based query cứng đảm bảo tính ổn định khi AI không khả dụng

### 11.4 Video Pipeline — Video Local

```
Input: File video (bat ky dinh dang, <=500MB)
    |
    v
[Multer] -> uploads/videos/<timestamp>_<random>.<ext>
    |
    +---> [ffmpeg extractThumbnail] -> uploads/thumbnails/<name>.jpg (frame tai giay 1)
    |
    +---> [ffmpeg extractAudio] -> uploads/audio/<name>.mp3 (128kbps, tam thoi)
              |
              v
         [transcribeAudio - Orchestrator]
              |
              +---> Gemini AI (2.0-flash -> 1.5-flash -> 1.5-flash-8b)
              |     - Upload audio len Google AI File Manager
              |     - Gui prompt + audio file URI
              |     - Parse output -> [{time, text}, ...]
              |
              +---> (fallback) Deepgram API nova-3
                    - POST audio data -> Deepgram
                    - Nhan utterances voi timestamps
                    - Map sang [{time, text}, ...]
    |
    v (audio MP3 bi xoa sau transcription)
MongoDB: Video { isLocal: true, transcript: [...], thumbnail: "..." }
```

### 11.5 Transcript YouTube Pipeline

```
1. GET /api/video/transcript/:youtubeId
2. Check DB cache: Video.findOne({youtubeId}).transcript.length > 0?
   - HIT: return cached transcript immediately
   - MISS: YoutubeTranscript.fetchTranscript(youtubeId)
           -> items[].{offset(ms), text}
           -> map: { time: formatTime(offset), text: text.trim() }
           -> update Video.transcript in DB (neu video da saved)
           -> return transcript
```

### 11.6 Dictionary Pipeline

```
GET /api/dictionary?word=<word>
    |
    +-- Cache hit (Map, TTL 24h) -> return immediately
    |
    +-- Cache miss:
        +-- [song song] Free Dictionary API: api.dictionaryapi.dev
        |   +-- fallback: Wiktionary API
        |
        +-- [song song] Google Translate API (gtx client, dt=t,bd)
        |   - dt=t: dich don gian
        |   - dt=bd: bilingual dictionary (tu loai + cac nghia)
        |
        +-- Merge results -> cache -> return {phonetic, dictMeanings, translation}
```

---

## 12. PHÂN TÍCH BẢO MẬT

### 12.1 Authentication và Authorization

**Điểm mạnh:**

- JWT với secret key từ biến môi trường (JWT_SECRET)
- Token hết hạn sau 7 ngày (expiresIn: "7d")
- Mật khẩu băm bằng bcryptjs salt 10 vòng
- Google OAuth xác thực phía server bằng google-auth-library
- Mọi endpoint nhạy cảm yêu cầu JWT qua authMiddleware
- Mọi query đều lọc theo userId để ngăn truy cập dữ liệu người khác

**Điểm yếu:**

- Token lưu trong localStorage: Dễ bị XSS tấn công. Nên dùng HttpOnly cookie.
- vocabularyController.js tự decode JWT thay vì dùng authMiddleware: Không nhất quán.
- Không có refresh token: Khi hết hạn người dùng bị đăng xuất ngay.

### 12.2 Input Validation

**Điểm mạnh:**

- Mongoose schema có required, maxlength, enum validation
- Multer giới hạn kích thước file (5MB avatar, 500MB video) và kiểm tra MIME type

**Điểm yếu:**

- Không sử dụng thư viện validation (Joi, Zod, express-validator)
- Thiếu sanitization đầu vào để ngăn NoSQL Injection
- Không áp dụng đồng nhất

### 12.3 CORS

```javascript
// backend/src/server.js
app.use(cors()); // Cho phep TAT CA origins
```

Rủi ro: CORS mở hoàn toàn cho phép bất kỳ origin nào gọi API.

### 12.4 Rate Limiting

Không tìm thấy trong mã nguồn. Không có giới hạn tần suất yêu cầu -> dễ bị brute-force hoặc DDoS.

### 12.5 Content Security Policy

File: frontend-new/next.config.ts

```
"Content-Security-Policy": "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com;"
```

CSP chỉ thiết lập frame-src, chưa đầy đủ các directive khác.

### 12.6 Rủi ro thanh toán

POST /api/auth/upgrade cho phép tự kích hoạt Premium không cần xác minh thanh toán. Đây là lỗ hổng nghiêm trọng.

### 12.7 Tóm tắt đánh giá bảo mật

| Hạng mục             | Trạng thái                         | Mức độ rủi ro |
| -------------------- | ---------------------------------- | ------------- |
| Password hashing     | Tốt - bcryptjs salt 10             | Thấp          |
| JWT authentication   | Tốt - có expiry                    | Thấp          |
| JWT storage          | Cảnh báo - localStorage (XSS risk) | Trung bình    |
| Google OAuth         | Tốt - server-side verification     | Thấp          |
| CORS                 | Cảnh báo - mở hoàn toàn            | Trung bình    |
| Rate limiting        | Không có                           | Cao           |
| Input validation     | Cơ bản, không đồng nhất            | Trung bình    |
| NoSQL Injection      | Chưa có sanitization               | Trung bình    |
| Payment verification | Không có                           | Rất cao       |
| HTTPS                | Không tìm thấy trong mã nguồn      | —             |

---

## 13. ĐÁNH GIÁ CHẤT LƯỢNG MÃ NGUỒN

### 13.1 Readability (Khả năng đọc hiểu): 7/10

**Điểm mạnh:**

- Comment tiếng Việt inline rõ ràng trong backend
- Tên biến, hàm mô tả tốt
- Cấu trúc controller nhất quán: try/catch, early return pattern
- Emoji trong console.log giúp dễ theo dõi log

**Điểm yếu:**

- videoController.js rất dài (>400 dòng) — cần tách thành nhiều module
- vocabulary/page.tsx phức tạp, logic UI/state/API lẫn lộn
- feed/page.tsx cực kỳ dài với nhiều sub-component inline

### 13.2 Maintainability (Khả năng bảo trì): 6/10

**Điểm mạnh:**

- Tách biệt rõ routes/controllers/models/services
- authMiddleware tái sử dụng tốt

**Điểm yếu:**

- URL API http://localhost:5000 hardcode ở hàng chục file frontend
- Không có tầng service trong frontend
- Logic lấy token lặp lại trong gần như mọi component
- vocabularyController.js tự decode JWT không nhất quán
- Thiếu centralized error handling

### 13.3 Scalability (Khả năng mở rộng): 5/10

**Điểm mạnh:**

- MongoDB cho phép scale theo chiều ngang
- Tách biệt frontend/backend cho phép scale độc lập

**Điểm yếu:**

- File video lưu trên local disk
- In-memory cache trong dictionaryController mất khi restart server
- Không có CDN cho static assets/videos
- Không có caching ở API level

### 13.4 Reusability (Khả năng tái sử dụng): 6/10

**Điểm mạnh:**

- UI components cơ bản (Button, Card, Input) dùng chung
- authMiddleware tái sử dụng tốt
- i18n.tsx context tập trung

**Điểm yếu:**

- Không có custom hooks cho API calls
- Logic UI lặp lại giữa practice/[videoId] và practice/local/[id]
- Không có API service layer tập trung

### 13.5 Testability (Khả năng kiểm thử): 2/10

Không tìm thấy bất kỳ test nào trong mã nguồn. package.json backend: "test": "echo Error: no test specified && exit 1". Không có framework test, mock, hay test file nào.

### 13.6 Tổng điểm

| Tiêu chí        | Điểm       |
| --------------- | ---------- |
| Readability     | 7/10       |
| Maintainability | 6/10       |
| Scalability     | 5/10       |
| Reusability     | 6/10       |
| Testability     | 2/10       |
| **Trung bình**  | **5.2/10** |

---

## 14. ƯU ĐIỂM CỦA HỆ THỐNG

### 14.1 Kiến trúc

- Tách biệt rõ ràng frontend/backend — dễ phát triển song song
- MVC backend thuần — dễ hiểu cho lập trình viên mới
- App Router của Next.js — tận dụng tính năng hiện đại

### 14.2 Tính năng AI phong phú

- Transcription AI với cơ chế multi-model fallback (Gemini 2.0 -> 1.5 -> 1.5-8B -> Deepgram) đảm bảo độ tin cậy cao
- Gợi ý video cá nhân hóa thực sự dựa trên survey, không phải hệ thống cứng
- Tra từ điển multi-source (Free Dictionary + Wiktionary + Google Translate) với cache 24h

### 14.3 Trải nghiệm người dùng

- Transcript đồng bộ thời gian thực khi xem video — điểm học tập độc đáo
- Lưu từ vựng theo ngữ cảnh trực tiếp từ transcript — gắn với video nguồn
- Streak tracking + email nhắc nhở — khuyến khích học đều đặn
- Giao diện dark mode đẹp, nhất quán, màu sắc chuyên nghiệp
- Hỗ trợ song ngữ EN/VI ngay trong app

### 14.4 Xử lý video đa dạng

- Hỗ trợ cả video YouTube (stream/transcript) và video tải lên (local, AI transcription)
- Stream video YouTube trực tiếp không cần tải về
- Trích xuất thumbnail tự động bằng ffmpeg

### 14.5 Tính năng cộng đồng

- Feed phân quyền (public/friends) — kiểm soát nội dung thông minh
- Chia sẻ từ vựng dưới dạng vocab post — tính năng độc đáo
- Hồ sơ công khai với thống kê học tập

---

## 15. HẠN CHẾ VÀ RỦI RO

### 15.1 Hạn chế kỹ thuật

| Hạng mục                       | Mô tả                                           | Mức độ       |
| ------------------------------ | ----------------------------------------------- | ------------ | ------------------------------------------------ | ------------ |
| API URL hardcode               | http://${process.env.NEXT_PUBLIC_API_URL        |              | 'http://localhost:5000'} trong ~30 file frontend | Nghiêm trọng |
| Local file storage             | Video/thumbnail lưu trên disk, không scale được | Cao          |
| Không có test                  | Rủi ro regression cao khi thêm tính năng mới    | Cao          |
| Không có rate limiting         | Dễ bị spam/brute-force                          | Cao          |
| CORS mở                        | Cho phép tất cả origins                         | Trung bình   |
| Thanh toán giả                 | Không tích hợp payment gateway thực             | Nghiêm trọng |
| JWT trong localStorage         | XSS vulnerability                               | Trung bình   |
| In-memory dictionary cache     | Mất khi restart server                          | Thấp         |
| Không có pagination vocabulary | Tải toàn bộ danh sách một lần                   | Trung bình   |

### 15.2 Nợ kỹ thuật (Technical Debt)

1. Thiếu API service layer: Mỗi component tự gọi fetch() với URL hardcode
2. Trùng lặp logic: Hai trang practice có cấu trúc gần giống nhau, chưa refactor
3. Frontend cũ: Thư mục frontend/ vẫn tồn tại nhưng không dùng
4. README rỗng: Không có hướng dẫn cài đặt và chạy dự án
5. Không có environment config cho dev/staging/production
6. vocabularyController tự decode JWT thay vì dùng authMiddleware

### 15.3 Điểm nghẽn hiệu năng

1. AI Transcription: Upload audio lên Google AI + chờ Gemini mất 30-60 giây
2. YouTube recommendations: Gọi yt-search nhiều lần song song — dễ rate limit
3. Vocabulary page: Tải toàn bộ từ vựng không phân trang
4. Video upload: Không giới hạn số concurrent uploads

### 15.4 Rủi ro bảo mật

1. Thanh toán không xác thực: User nào cũng có thể gọi /api/auth/upgrade tự kích hoạt Premium
2. Không có HTTPS: Mã nguồn không cấu hình SSL
3. youtube-dl-exec: Tải video YouTube có thể vi phạm YouTube ToS

---

## 16. ĐỀ XUẤT CẢI TIẾN

### 16.1 Ngắn hạn (0–1 tháng) — Sửa lỗi nghiêm trọng

1. **Chuyển API URL sang biến môi trường**
   - Tạo frontend-new/.env.local: NEXT_PUBLIC_API_URL=http://localhost:5000
   - Thay thế tất cả http://localhost:5000 trong ~30 file frontend

2. **Tạo API service layer cho frontend**
   - Tạo frontend-new/lib/api.ts với các hàm fetch có base URL từ env
   - Tập trung xử lý token, error handling

3. **Thêm Rate Limiting**
   - Cài đặt express-rate-limit cho backend
   - Giới hạn đặc biệt cho login, register, upload

4. **Sửa CORS**
   - Cấu hình cors() chỉ cho phép origin frontend cụ thể

5. **Hoàn thiện README**
   - Thêm hướng dẫn cài đặt, chạy dự án, cấu hình env

6. **Xóa thư mục frontend/ cũ**

### 16.2 Trung hạn (1–3 tháng) — Nâng cao chất lượng

1. **Tích hợp payment gateway thực tế**
   - VNPay hoặc MoMo để xác minh trước khi kích hoạt Premium
   - Thêm webhook xác nhận thanh toán

2. **Chuyển lưu trữ file lên Cloud**
   - Tích hợp Cloudinary (đã có trong package.json) cho video và ảnh
   - Hoặc dùng AWS S3 / Cloudflare R2

3. **Thêm unit test và integration test**
   - Cài đặt Jest cho backend
   - Viết test cho authController, videoController
   - Test critical business logic (streak, progress tracking)

4. **Refactor trang Practice thành shared components**
   - Tạo shared TranscriptPanel, DictionaryPanel, VideoPlayer
   - Giảm trùng lặp giữa practice/[videoId] và practice/local/[id]

5. **Thêm Input Validation chuẩn**
   - Cài đặt express-validator hoặc zod cho backend

6. **Chuyển JWT storage sang HttpOnly Cookie**
   - Bảo vệ khỏi XSS attacks

7. **Thêm Pagination cho Vocabulary page**

8. **Thống nhất authentication trong vocabularyController**

### 16.3 Dài hạn (3–6 tháng) — Mở rộng quy mô

1. **Containerization với Docker**
   - Dockerfile cho backend và frontend
   - docker-compose.yml cho môi trường phát triển

2. **CI/CD Pipeline**
   - GitHub Actions cho auto-test và auto-deploy
   - Deploy frontend lên Vercel, backend lên Railway/Render

3. **Caching với Redis**
   - Thay thế in-memory dictionary cache
   - Cache recommendations results
   - Session management với Redis

4. **Tính năng thực hành nâng cao**
   - Chế độ dictation (gõ theo transcript)
   - Chế độ shadowing (đọc theo)
   - Flashcard spaced repetition cho từ vựng

5. **Analytics Dashboard**
   - Thống kê chi tiết tiến trình học theo tuần/tháng
   - Biểu đồ từ vựng học được, thời gian học

6. **Notification system thực sự**
   - WebSocket hoặc SSE cho real-time notifications

---

## 17. KẾT LUẬN

### Mức độ hoàn thiện của dự án

Smart Video là một dự án ở giai đoạn **MVP (Minimum Viable Product) hoàn chỉnh đến Beta**. Toàn bộ luồng nghiệp vụ cốt lõi đã được triển khai và hoạt động: đăng ký, đăng nhập, lưu video, luyện tập với transcript, lưu từ vựng, gợi ý video AI, hệ thống cộng đồng và theo dõi tiến trình.

Một số module quan trọng cho production chưa hoàn thiện: thanh toán thực tế, lưu trữ file phân tán, kiểm thử tự động và cấu hình deployment.

### Chất lượng kiến trúc

Kiến trúc tổng thể **rõ ràng và phù hợp với quy mô dự án**. Tách biệt frontend/backend, áp dụng MVC ở phía server, MongoDB cho dữ liệu linh hoạt là các lựa chọn hợp lý. Thiếu một số pattern quan trọng như service layer ở frontend, centralized error handling, và testing infrastructure.

### Khả năng mở rộng

Ở quy mô nhỏ (vài trăm đến vài nghìn người dùng), hệ thống hiện tại có thể hoạt động ổn. Để mở rộng lên hàng chục nghìn người dùng, cần giải quyết vấn đề local file storage, in-memory cache, và thêm horizontal scaling support.

### Giá trị kinh doanh

Smart Video giải quyết bài toán thực tế với thị trường rõ ràng tại Việt Nam. Tính năng gợi ý video cá nhân hóa bằng AI và transcript đồng bộ thời gian thực là điểm khác biệt so với ứng dụng học tiếng Anh thông thường. Mô hình Freemium có tiềm năng thương mại hóa, nhưng cần payment gateway thực tế trước khi launch.

### Đánh giá tổng thể

| Tiêu chí                | Đánh giá                                |
| ----------------------- | --------------------------------------- |
| Độ hoàn thiện tính năng | Tốt (70-75%)                            |
| Chất lượng kiến trúc    | Khá (60%)                               |
| Chất lượng mã nguồn     | Khá (52%)                               |
| Bảo mật                 | Trung bình (50%)                        |
| Khả năng mở rộng        | Cần cải thiện (45%)                     |
| Sẵn sàng cho production | Chưa sẵn sàng (cần sửa critical issues) |

**Nhận xét chung:** Smart Video là một dự án học tập/thương mại có tư duy thiết kế sản phẩm tốt với nhiều tính năng AI thú vị. Nền tảng kỹ thuật đủ vững để phát triển thêm. Ưu tiên hàng đầu trước khi launch: (1) tích hợp payment gateway thực tế, (2) chuyển lưu trữ file lên cloud, (3) cấu hình deployment và environment variables, (4) bổ sung rate limiting và biện pháp bảo mật cơ bản.
