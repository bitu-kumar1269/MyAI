pipeline {
    agent any

    environment {
        DOCKER_USERNAME = 'bitukumar'
        EC2_HOST        = '54.227.9.167'
        EC2_USER        = 'ubuntu'
        FRONTEND_IMAGE  = "bitukumar/notes-frontend:latest"
        BACKEND_IMAGE   = "bitukumar/notes-backend:latest"
        PATH            = "/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:${env.PATH}"
    }

    stages {

        stage('Checkout') {
            steps {
                echo '📦 Checking out code...'
                checkout scm
            }
        }

        stage('Build Images') {
            steps {
                echo '🐳 Building Docker images...'
                sh '''
                    export PATH=/usr/local/bin:/opt/homebrew/bin:$PATH
                    docker build -t bitukumar/notes-frontend:latest ./frontend
                    docker build -t bitukumar/notes-backend:latest ./backend
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo '⬆️ Pushing images to Docker Hub...'
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        export PATH=/usr/local/bin:/opt/homebrew/bin:$PATH
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        docker push bitukumar/notes-frontend:latest
                        docker push bitukumar/notes-backend:latest
                    '''
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                echo '🚀 Deploying to AWS EC2...'
                sshagent(['ec2-ssh-key']) {
                    sh """
                        export PATH=/usr/local/bin:/opt/homebrew/bin:$PATH
                        scp -o StrictHostKeyChecking=no docker-compose.yml ${EC2_USER}@${EC2_HOST}:~/mern-app/docker-compose.yml
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

    post {
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}