<div align="center">

# AI Career Intelligence Platform
<p align="center"> <img src="https://capsule-render.vercel.app/api?type=wave&color=0:0f0f0f,100:4facfe&height=250&section=header&text=HireX%20🚀&fontSize=60&fontColor=ffffff"/> </p> <p align="center"> <b>AI-powered platform for coding, aptitude & interview preparation</b> </p>
---

## 📌 About HireX

HireX is an **AI-powered career intelligence platform** designed to help students prepare for **campus placements and software job interviews**.

It combines:
- 🧠 Coding Practice  
- 📊 Aptitude Testing  
- 🎤 Mock Interviews  
- 🤖 AI Mentor Chatbot  

All in a single structured daily preparation system.

---

## 🌐 Live Demo

🔗 **Website:** https://hirex-weld.vercel.app  

---

## 🎯 Target Users

- 🎓 Final Year Engineering Students  
- 📘 Pre-Final Year Students  
- 💼 Software Job Seekers  

---

## ⚙️ Technology Stack

### 🎨 Frontend
<p>
<img src="https://img.shields.io/badge/Next.js-000000.svg?style=for-the-badge&logo=next.js&logoColor=white" />
<img src="https://img.shields.io/badge/React-20232A.svg?style=for-the-badge&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/React%20DOM-20232A.svg?style=for-the-badge&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/CSS3-1572B6.svg?style=for-the-badge&logo=css3&logoColor=white" />
</p>

---

### ⚙️ Backend
<p>
<img src="https://img.shields.io/badge/Node.js-339933.svg?style=for-the-badge&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Express.js-000000.svg?style=for-the-badge&logo=express&logoColor=white" />
<img src="https://img.shields.io/badge/MongoDB-47A248.svg?style=for-the-badge&logo=mongodb&logoColor=white" />
<img src="https://img.shields.io/badge/Mongoose-880000.svg?style=for-the-badge" />
</p>

---

### 🔐 Authentication & Security
<p>
<img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
<img src="https://img.shields.io/badge/bcrypt-003A70?style=for-the-badge" />
<img src="https://img.shields.io/badge/CORS-enabled-2E8B57?style=for-the-badge" />
</p>

---

### 🤖 AI & Tools
<p>
<img src="https://img.shields.io/badge/OpenAI-412991.svg?style=for-the-badge&logo=openai&logoColor=white" />
<img src="https://img.shields.io/badge/Multer-Upload-orange?style=for-the-badge" />
<img src="https://img.shields.io/badge/dotenv-Environment-yellow?style=for-the-badge" />
</p>

---

### 🚀 Deployment
<p>
<img src="https://img.shields.io/badge/Vercel-000000.svg?style=for-the-badge&logo=vercel&logoColor=white" />
<img src="https://img.shields.io/badge/MongoDB%20Atlas-00ED64.svg?style=for-the-badge&logo=mongodb&logoColor=white" />
</p>

---

## 📱 Application Features

### 🔐 Authentication System
- Secure registration & login  
- JWT authentication  
- Password hashing (bcrypt)  
- Resume upload  

---

### 📊 Dashboard
- Placement readiness score  
- Coding / Aptitude / Communication tracking  
- Weekly performance chart  
- Skill gap analysis  

---

### 🧠 Daily Preparation System
| Activity | Time | Purpose |
|----------|------|---------|
| Coding Practice | 30 min | DSA problem solving |
| Mock Test | 20 min | Aptitude & reasoning |
| Mock Interview | 10 min | Communication skills |

---

### 💻 Coding Practice
- Daily rotating DSA problems  
- Hint system  
- Score tracking  
- Reference solutions  

---

### 🧪 Mock Test
- Aptitude / Logical / Technical MCQs  
- Timed quiz system  
- Auto evaluation  

---

### 🎤 Mock Interview
- AI-generated questions  
- Answer evaluation system  
- Feedback per question  
- Communication scoring  

---

### 🤖 HireX Mentor
- AI career assistant  
- DSA help  
- Resume guidance  
- Interview preparation tips  

---

### 👤 Profile System
- Edit skills  
- Update dream company  
- Upload resume  
- View performance stats  

---

## 🗄️ Database Models

- 👤 User Model  
- 🧪 Quiz Model  
- 📈 Progress Model  

---

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`

### Quiz
- `POST /api/quiz/generate`
- `POST /api/quiz/submit`
- `GET /api/quiz/history`

### Interview
- `GET /api/interview/start`
- `POST /api/interview/submit`
- `GET /api/interview/history`

### Skills
- `GET /api/skills/daily-problem`
- `POST /api/skills/submit-solution`
- `GET /api/skills/progress`

---

## 🔐 Security

- 🔒 bcrypt password encryption  
- 🔑 JWT authentication  
- 🧾 Input validation  
- 🌐 CORS protection  

---

## ⚙️ Environment Variables

```env
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_openai_key
PORT=5000
