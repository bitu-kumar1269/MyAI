QuickAI 🚀

An AI-powered full-stack web application built with the MERN Stack, integrated with Google Gemini AI, containerized using Docker, and deployed through a CI/CD pipeline using GitHub Actions and AWS EC2.

🌟 Features
🤖 AI-powered chat assistant using Gemini API
🔐 Secure backend API integration
⚡ Fast and responsive React frontend
📦 Dockerized application
🔄 Automated CI/CD with GitHub Actions
☁️ AWS EC2 deployment
🗄️ MongoDB database integration
📱 Responsive UI for desktop and mobile devices
🏗️ Tech Stack
Frontend
React.js
JavaScript
HTML5
CSS3
Backend
Node.js
Express.js
Database
MongoDB
AI Integration
Google Gemini API
DevOps
Docker
GitHub Actions
AWS EC2
📂 Project Structure
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
🚀 Architecture
User
  │
  ▼
React Frontend
  │
  ▼
Node.js + Express Backend
  │
  ├── Gemini API
  │
  └── MongoDB
Deployment Flow
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
⚙️ Environment Variables

Create a .env file inside the backend directory.

PORT=5000

MONGODB_URI=your_mongodb_connection_string

GEMINI_API_KEY=your_gemini_api_key

JWT_SECRET=your_jwt_secret
🐳 Docker Setup
Build Images
docker compose build
Run Containers
docker compose up -d
Stop Containers
docker compose down
🔄 CI/CD Pipeline

The project uses GitHub Actions to automate:

Source code checkout
Docker image build
Docker image push to Docker Hub
Deployment to AWS EC2
Container restart with latest image
Required GitHub Secrets
DOCKER_USERNAME
DOCKER_PASSWORD
EC2_HOST
EC2_USER
EC2_SSH_KEY
GEMINI_API_KEY
☁️ AWS Deployment
EC2 Setup
sudo apt update
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
Pull Latest Image
docker pull your-dockerhub-username/quickai:latest
Run Container
docker run -d -p 5000:5000 \
-e GEMINI_API_KEY=YOUR_KEY \
your-dockerhub-username/quickai:latest
🔒 Security Best Practices
Never commit .env files
Store secrets in GitHub Actions Secrets
Keep Gemini API key on the backend only
Rotate compromised API keys immediately
Use HTTPS in production
📸 Screenshots

Add screenshots of:

Home Page
<img width="2934" height="1602" alt="image" src="https://github.com/user-attachments/assets/587b0408-75ff-42f1-8668-b00df0c5c064" />
<img width="2932" height="1600" alt="image" src="https://github.com/user-attachments/assets/0217f5f1-b60e-42fb-b090-61e5608471a9" />
<img width="2930" height="1598" alt="image" src="https://github.com/user-attachments/assets/62d67c9f-f684-4483-bce7-3925dde1671e" />

Chat Interface
<img width="2938" height="1598" alt="image" src="https://github.com/user-attachments/assets/2113d191-487f-4297-9183-251b741bce88" />

AI Response Generation
<img width="2940" height="1596" alt="image" src="https://github.com/user-attachments/assets/46c26863-1362-4c68-89b0-c69ef94aa3f6" />

Docker Deployment
<img width="2938" height="1596" alt="image" src="https://github.com/user-attachments/assets/3fd3c459-c14d-47b1-911e-536cc0dd10b0" />

GitHub Actions Workflow
<img width="2936" height="1592" alt="image" src="https://github.com/user-attachments/assets/40c73f3c-323c-4843-ae50-aee6a555a45c" />


🎯 Learning Outcomes

This project helped in understanding:

Full Stack MERN Development
REST API Design
Gemini AI Integration
Docker Containerization
CI/CD Pipeline Automation
AWS Cloud Deployment
Environment Variable Management
Production Deployment Practices
## 👨‍💻 Author

**Bitu Kumar**

Software Developer | MERN Stack Developer | DevOps Enthusiast

### Connect

- GitHub: [https://github.com/your-github-username](https://github.com/bitu-kumar1269)
- LinkedIn: [https://linkedin.com/in/your-linkedin-usernamel](https://www.linkedin.com/in/bitukumar1269/)

⭐ Support

If you like this project, please give it a star ⭐ on GitHub and feel free to contribute!
