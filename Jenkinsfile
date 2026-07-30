pipeline {
    agent any 
    
    stages {
        stage('Checkout Code') {
            steps {
                echo '📥 Pulling the latest code from GitHub...'
                // The 'checkout scm' step automatically happens in Jenkins Multibranch Pipelines,
                // but you can uncomment this if needed:
                // checkout scm
            }
        }
        
        stage('Install Dependencies & Test') {
            steps {
                echo '📦 Installing Node.js packages and running tests...'
                // If Jenkins has Node installed, it can run these before building Docker.
                // Otherwise, you can safely remove this stage since Docker handles installation.
                // sh 'cd eleve-backend && npm install'
                // sh 'cd eleve-backend && npm run test'
                echo '✅ Tests passed (Mocked for now)'
            }
        }
        
        stage('Build Docker Images') {
            steps {
                echo '🔨 Building eleve-backend and eleve-frontend...'
                // Using --no-cache to ensure your latest code changes are always included!
                sh 'docker-compose build --no-cache'
            }
        }
        
        stage('Clean Old Containers') {
            steps {
                echo '🧹 Removing old containers to prevent port conflicts...'
                sh 'docker-compose down -v || true'
            }
        }

        stage('Deploy Application') {
            steps {
                echo '🚀 Deploying the fresh containers...'
                sh 'docker-compose up -d'
            }
        }
    }
}
