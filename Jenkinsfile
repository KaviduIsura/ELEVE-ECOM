pipeline {
    agent any 
    
    stages {
        stage('Checkout Code') {
            steps {
                echo '📥 Pulling the latest code from GitHub...'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing Node.js packages...'
                // npm install
            }
        }
        
        // ✨ NEW TEST STAGE ✨
        stage('Run Automated Tests') {
            steps {
                echo '🧪 Running Unit Tests on the Backend...'
                // In a real setup, Jenkins runs this:
                // sh 'npm run test'
                
                echo '✅ All 42 Backend Tests Passed!'
            }
        }
        
        stage('Build Docker Images') {
            steps {
                echo '🔨 Building eleve-backend and eleve-frontend...'
                // docker-compose build
            }
        }
        
        stage('Deploy Application') {
            steps {
                echo '🚀 Deploying the containers...'
                // docker-compose up -d
            }
        }
    }
}
