# 🛡️ Sevak - AI Public Safety Ecosystem

<div align="center">

**A comprehensive platform for public safety reporting and intelligent assistance**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

*Empowering communities with AI-driven chatbot support and seamless incident reporting.*

</div>

---

## 📖 Overview

**Sevak** is a full-scale public safety ecosystem designed to help communities report incidents easily while providing intelligent emergency and safety information through an AI Agent. The project is structured into three primary modules to ensure scalability, robust conversational capabilities, and a seamless user experience.

---

## ✨ System Architecture

### 1️⃣ AI Public Safety Chatbot (`/backend`)
A powerful RAG-powered chatbot utilizing vector searches to provide contextually accurate responses.
- **Features:** Smart responses via Google Gemini / OpenAI fallback, vector search integration, and reliable relational data storage.
- **Technologies:** FastAPI, Python, Prisma ORM, PostgreSQL, ChromaDB / Qdrant.

### 2️⃣ ReportBox Core API (`/ReportBox-Backend`)
A reliable REST API built to handle incoming public reports and manage notifications.
- **Features:** Secure incident logging, database management, and Twilio integration for SMS/alert notifications.
- **Technologies:** Node.js, Express, Mongoose (MongoDB), and Twilio.

### 3️⃣ ReportBox Frontend (`/ReportBox-front`)
A modern, responsive user interface designed for public access and dashboard management.
- **Features:** Intuitive incident reporting, clean dashboards, and scalable component architecture.
- **Technologies:** React 19, Vite, Tailwind CSS, Lucide React, and React Router.

---

## 🛠️ Tech Stack Directory

| Component | Stack/Technology | Location | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | React, TailwindCSS, Vite | `/ReportBox-front` | Public-facing dashboards and reporting user interfaces. |
| **Core API** | Node.js, Express, MongoDB | `/ReportBox-Backend` | Incident handling, REST endpoints, SMS triggers. |
| **AI Agent** | FastAPI, Prisma, PostgreSQL | `/backend` | Vector-backed AI chatbot logic, semantic search, generative responses. |

---

## 🚀 Quick Start

Follow the instructions below to get the entire **Sevak** ecosystem running locally. Make sure you have **Node.js**, **Python**, **MongoDB**, and **PostgreSQL** installed.

### 1. Launch the AI RAG Backend
Navigate to the `backend` directory, set up your Python environment, and start the system:
```bash
cd backend
python -m venv venv
# Activate your environment
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

pip install -r requirements.txt
python -m spacy download en_core_web_sm
```
*Note: Make sure to follow the DB and `.env` setup instructions in [`backend/Readme.md`](./backend/Readme.md).*
```bash
uvicorn app.main:app --reload
```

### 2. Launch the Core Node.js API
Navigate to the `ReportBox-Backend` directory to set up the incident reporting API.
```bash
cd ReportBox-Backend
npm install
```
*Note: Create your `.env` file containing your MongoDB URI and Twilio configurations.*
```bash
npm start
```

### 3. Launch the User Interface
Finally, navigate to the frontend directory to run the UI application.
```bash
cd ReportBox-front
npm install
npm run dev
```

---

## 🤝 Contributing

We welcome community contributions! Please feel free to submit a Pull Request.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

<div align="center">

**Built with 🛠️ for safer communities**

</div>
