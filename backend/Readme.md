# 🤖 AI Public Safety Chatbot ( RAG Agent )

<div align="center">

**A powerful RAG-powered chatbot backend built with modern technologies**

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)](https://python.org/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

*Intelligent conversations powered by Retrieval-Augmented Generation*

</div>

---

## ✨ Features

🧠 **Smart AI Responses** - Powered by Google Gemini API  
📊 **Vector Search** - ChromaDB for intelligent context retrieval  
💾 **Persistent Storage** - PostgreSQL with Prisma ORM  
🚀 **High Performance** - Built with FastAPI  
🔒 **Type Safe** - Pydantic validation throughout  

---

## 🛠️ Tech Stack

| Component          | Technology      | Purpose                                 |
|-------------------|------------------|-----------------------------------------|
| **Web Framework** | FastAPI          | High-performance API server             |
| **AI Model**       | Google Gemini    | Natural language generation             |
| **Vector Database**| ChromaDB / Qdrant| Semantic search & context retrieval     |
| **Database**       | PostgreSQL       | Persistent data storage                 |
| **ORM**            | Prisma           | Type-safe database operations           |
| **Validation**     | Pydantic         | Request/response data validation        |


---
### Choice you get
- Vector Database: ChromaDb or Qdrant
- LLM Model: OpenAI or Gemini
## 🚀 Quick Start

### 1️⃣ Clone & Setup

```bash
# Clone the repository
git clone https://github.com/your-username/sevak-backend.git
cd sevak-backend
```

### 2️⃣ Create Virtual Environment

**Using Python venv:**
```bash
python -m venv venv

# Activate environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

**Using Conda:**
```bash
conda create -n rag-chatbot python=3.10
conda activate rag-chatbot
```

### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

### 4️⃣ Environment Configuration

#### If using docker to run postgres server to generate url
```bash
docker run --name postgres-server \
  -e POSTGRES_USER=<myuser> \
  -e POSTGRES_PASSWORD=<mypassword> \
  -e POSTGRES_DB=mydatabase \
  -p <PORT>:5432 \
  -v pgdata:/var/lib/postgresql/data \
  -d postgres

```

Create a `.env` file in the root directory:

```env
# 🗄️ Database Configuration
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<chatbot_db>

# 🤖 AI Model Configuration
GOOGLE_API_KEY=your_gemini_api_key_here
GOOGLE_AI_MODEL_NAME=models/gemini-1.5-pro

# 🔧 Optional: OpenAI Fallback
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL_NAME=gpt-4o

# 📊 Vector Database
CHROMA_DB_PATH=./chroma_store

# 🐳 Optional: Qdrant Cloud
QDRANT_CLUSTER_URL=http://localhost:6333
QDRANT_API_KEY=your_qdrant_api_key
```

### 5️⃣ Prisma Setup

```bash
# Install Prisma globally
npm install -g prisma

# Generate Prisma client
prisma generate

# To Watch Database
npx prisma studio
```

### 6️⃣ Optional: Qdrant with Docker

```bash
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
```

### 7️⃣ Launch the Server

```bash
uvicorn app.main:app --reload
```

🎉 **Your chatbot backend is now running at** `http://localhost:8000`

---

## 📚 API Documentation

Once the server is running, visit:
- **Interactive Docs**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---


## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with 🛠️ for intelligent conversations**

</div>