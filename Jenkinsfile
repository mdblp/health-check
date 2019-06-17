#!groovy
@Library('mdblp-library') _

pipeline {
    agent any
    stages {
        stage('Build and package') { 
             agent {
                docker {
                    image 'node:10.13.0-alpine'
                }
            }
            steps { 
                sh 'npm install'
                sh 'sh ./qa/distrib.sh'
                sh 'sh ./qa/package.sh "${GIT_COMMIT}"'
                stash name: "package", includes: "health-check-${GIT_COMMIT}.tar.gz"
            }
        }
        stage('Acceptance tests'){
            agent {
                docker {
                    image 'node:10.13.0-alpine'
                }
            }
            steps {
                sh 'npm test'
            }
            post {
                always {
                    junit 'test-results.xml'
                }
            }   
        }
        stage('Publish') {
            when { branch "master" }
            steps {
                unstash "package"
                publish()
            }
        }
    }
}