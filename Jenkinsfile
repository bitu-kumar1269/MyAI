// pipeline {
//     agent any

//     environment {
//         DOCKER_USERNAME = 'bitukumar'
//         PATH            = "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${env.PATH}"
//     }

//     stages {

//         stage('Checkout') {
//             steps {
//                 echo '📦 Checking out code...'
//                 checkout scm
//             }
//         }

//         stage('Copy docker-compose') {
//             steps {
//                 echo '📋 Copying docker-compose.yml...'
//                 sh '''
//                     mkdir -p ~/mern-app
//                     cp docker-compose.yml ~/mern-app/docker-compose.yml
//                 '''
//             }
//         }

//         stage('Deploy') {
//             steps {
//                 echo '🚀 Deploying app on EC2...'
//                 sh '''
//                     export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
//                     cd ~/mern-app

//                     # Pull latest images from Docker Hub
//                     docker pull bitukumar/notes-frontend:latest
//                     docker pull bitukumar/notes-backend:latest

//                     # Restart containers
//                     docker-compose up -d --remove-orphans

//                     # Clean up
//                     docker image prune -f

//                     echo "✅ Deployed successfully!"
//                 '''
//             }
//         }
//     }

//     post {
//         success {
//             echo '✅ CD Pipeline completed successfully!'
//         }
//         failure {
//             echo '❌ CD Pipeline failed!'
//         }
//     }
// }



pipeline {
    agent any

    environment {
        DOCKER_USERNAME = 'bitukumar'
        PATH            = "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${env.PATH}"
        APP_DIR         = "/tmp/mern-app"
    }

    stages {

        stage('Checkout') {
            steps {
                echo '📦 Checking out code...'
                checkout scm
            }
        }

        stage('Copy docker-compose') {
            steps {
                echo '📋 Copying docker-compose.yml...'
                sh '''
                    mkdir -p /tmp/mern-app
                    cp docker-compose.yml /tmp/mern-app/docker-compose.yml
                    cp /var/jenkins_home/.env /tmp/mern-app/.env
                '''
            }
        }

        stage('Deploy') {
            steps {
                echo '🚀 Deploying app on EC2...'
                sh '''
                    export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
                    cd /tmp/mern-app

                    # Pull latest images from Docker Hub
                    docker pull bitukumar/notes-frontend:latest
                    docker pull bitukumar/notes-backend:latest

                    # Restart containers
                    docker-compose up -d --remove-orphans

                    # Clean up
                    docker image prune -f

                    echo "✅ Deployed successfully!"
                '''
            }
        }
    }

    post {
        success {
            echo '✅ CD Pipeline completed successfully!'
        }
        failure {
            echo '❌ CD Pipeline failed!'
        }
    }
}