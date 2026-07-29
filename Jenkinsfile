pipeline {
    // This tells Jenkins to run on any available worker node
    agent any 
    
    stages {
        stage('Checkout Code') {
            steps {
                echo '📥 Pulling the latest code from GitHub...'
                // In a real setup, Jenkins would run: git pull origin main
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing Node.js packages for Backend and Frontend...'
                // npm install
            }
        }
        
        stage('Build Docker Images') {
            steps {
                echo '🔨 Building eleve-backend and eleve-frontend Docker images...'
                // docker-compose build
            }
        }
        
        stage('Deploy Application') {
            steps {
                echo '🚀 Deploying the containers...'
                // docker-compose up -d
                echo '✅ ELEVÉ E-Commerce is live!'
            }
        }
    }
}
