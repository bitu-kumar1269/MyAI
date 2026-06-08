# QuickAI 🚀

> An AI-powered full-stack web application built with the **MERN Stack**, integrated with **Google Gemini AI**, containerized using **Docker**, and deployed through a **CI/CD pipeline** using GitHub Actions and AWS EC2.

---

## 🌟 Features

- 🤖 AI-powered chat assistant using Gemini API
- 🔐 Secure backend API integration
- ⚡ Fast and responsive React frontend
- 📦 Dockerized application
- 🔄 Automated CI/CD with GitHub Actions
- ☁️ AWS EC2 deployment
- 🗄️ MongoDB database integration
- 📱 Responsive UI for desktop and mobile devices

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, JavaScript, HTML5, CSS3 |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| AI Integration | Google Gemini API |
| DevOps | Docker, GitHub Actions, AWS EC2 |

---

## 📂 Project Structure

```
QuickAI/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── Dockerfile
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── Dockerfile
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

## 🚀 Architecture

```
User
  │
  ▼
React Frontend
  │
  ▼
Node.js + Express Backend
  │
  ├──▶ Gemini API
  │
  └──▶ MongoDB
```

### Deployment Flow

```
Developer Push
      │
      ▼
GitHub Repository
      │
      ▼
GitHub Actions
      │
      ▼
Docker Build
      │
      ▼
Docker Hub
      │
      ▼
AWS EC2 Deployment
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
```

---

## 🐳 Docker Setup

**Build Images**
```bash
docker compose build
```

**Run Containers**
```bash
docker compose up -d
```

**Stop Containers**
```bash
docker compose down
```

---

## 🔄 CI/CD Pipeline

The project uses **GitHub Actions** to automate:

1. Source code checkout
2. Docker image build
3. Docker image push to Docker Hub
4. Deployment to AWS EC2
5. Container restart with latest image

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `DOCKER_USERNAME` | Your Docker Hub username |
| `DOCKER_PASSWORD` | Your Docker Hub password |
| `EC2_HOST` | AWS EC2 public IP or hostname |
| `EC2_USER` | EC2 SSH username (e.g., `ubuntu`) |
| `EC2_SSH_KEY` | Private SSH key for EC2 access |
| `GEMINI_API_KEY` | Your Google Gemini API key |

---

## ☁️ AWS Deployment

### EC2 Setup

```bash
sudo apt update
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
```

### Pull Latest Image

```bash
docker pull your-dockerhub-username/quickai:latest
```

### Run Container

```bash
docker run -d -p 5000:5000 \
  -e GEMINI_API_KEY=YOUR_KEY \
  your-dockerhub-username/quickai:latest
```

---

## 🔒 Security Best Practices

- Never commit `.env` files to version control
- Store all secrets in **GitHub Actions Secrets**
- Keep the Gemini API key on the backend only — never expose it to the frontend
- Rotate any compromised API keys immediately
- Use **HTTPS** in production

---

## 📸 Screenshots

### Home Page

<img width="2934" alt="Home Page" src="https://github.com/user-attachments/assets/587b0408-75ff-42f1-8668-b00df0c5c064" />
<img width="2932" alt="Home Page 2" src="https://github.com/user-attachments/assets/0217f5f1-b60e-42fb-b090-61e5608471a9" />
<img width="2930" alt="Home Page 3" src="https://github.com/user-attachments/assets/62d67c9f-f684-4483-bce7-3925dde1671e" />

### Chat Interface

<img width="2938" alt="Chat Interface" src="https://github.com/user-attachments/assets/2113d191-487f-4297-9183-251b741bce88" />

### AI Response Generation

<img width="2940" alt="AI Response" src="https://github.com/user-attachments/assets/46c26863-1362-4c68-89b0-c69ef94aa3f6" />

### Docker Deployment

<img width="2938" alt="Docker Deployment" src="https://github.com/user-attachments/assets/3fd3c459-c14d-47b1-911e-536cc0dd10b0" />

### GitHub Actions Workflow

<img width="2936" alt="GitHub Actions" src="https://github.com/user-attachments/assets/40c73f3c-323c-4843-ae50-aee6a555a45c" />

---

## 🎯 Learning Outcomes

This project helped in understanding:

- Full Stack MERN Development
- REST API Design
- Gemini AI Integration
- Docker Containerization
- CI/CD Pipeline Automation
- AWS Cloud Deployment
- Environment Variable Management
- Production Deployment Practices

---

## 👨‍💻 Author

**Bitu Kumar** — Software Developer | MERN Stack | DevOps Enthusiast

[![GitHub](https://img.shields.io/badge/GitHub-bitu--kumar1269-181717?logo=github)](https://github.com/bitu-kumar1269)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-bitukumar1269-0A66C2?logo=linkedin)](https://www.linkedin.com/in/bitukumar1269/)

---

## ⭐ Support

If you found this project helpful, please give it a **star** ⭐ on GitHub and feel free to contribute!
