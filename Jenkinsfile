pipeline {
    agent {
        docker {
            image 'node:10.13.0-alpine'           
        }
    } 
    stages {
        stage('Build') { 
            steps { 
                sh 'npm install'
            }
        }
        stage('Acceptance tests'){
            steps {
                sh 'npm test'
            }
            post {
                always {
                    junit 'test-results.xml'
                }
            }   
        }
        stage('Deploy') {
            steps {
                echo "Not doing anything for now" 
            }
        }
    }
    /*
    post {
        failure {
            
        }
    }*/
}