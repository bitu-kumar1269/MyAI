pipeline {
    agent any

    environment {
        DOCKER_USERNAME    = 'your-dockerhub-username'
        EC2_HOST           = '52.54.84.196'
        EC2_USER           = 'ubuntu'
        FRONTEND_IMAGE     = "${DOCKER_USERNAME}/notes-frontend:latest"
        BACKEND_IMAGE      = "${DOCKER_USERNAME}/notes-backend:latest"
    }

    stages {

        // ── Stage 1: Checkout Code ─────────────────────────
        stage('Checkout') {
            steps {
                echo '📦 Checking out code...'
                checkout scm
            }
        }

        // ── Stage 2: Build Docker Images ───────────────────
        stage('Build Images') {
            steps {
                echo '🐳 Building Docker images...'
                sh 'docker build -t ${FRONTEND_IMAGE} ./frontend'
                sh 'docker build -t ${BACKEND_IMAGE} ./backend'
            }
        }

        // ── Stage 3: Push to Docker Hub ────────────────────
        stage('Push to Docker Hub') {
            steps {
                echo '⬆️ Pushing images to Docker Hub...'
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh 'docker push ${FRONTEND_IMAGE}'
                    sh 'docker push ${BACKEND_IMAGE}'
                }
            }
        }

        // ── Stage 4: Deploy to EC2 ─────────────────────────
        stage('Deploy to EC2') {
            steps {
                echo '🚀 Deploying to AWS EC2...'
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                            cd ~/mern-app
                            docker-compose pull
                            docker-compose up -d --remove-orphans
                            docker image prune -f
                            echo "✅ Deployed successfully!"
                        '
                    """
                }
            }
        }
    }

    // ── Post Actions ───────────────────────────────────────
    post {
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}