#!groovy
@Library('mdblp-library') _

pipeline {
    agent any
    stages {
        stage('Build and package') { 
             agent {
                docker {
                    image 'node:10.15-alpine'
                }
            }
            steps { 
                sh 'npm install'
                sh 'sh ./qa/distrib.sh'
                stash name: "distrib", includes: "**"
            }
        }
        stage('Acceptance tests') {
            agent {
                docker {
                    image 'node:10.13.0-alpine'
                }
            }
            steps {
                sh 'npm run jenkins_test'
            }
            post {
                always {
                    junit 'test-results.xml'
                }
            }   
        }
        stage('Package') {
            steps {
                unstash "distrib"
                pack()
                stash name: "package", includes: "health-check-${GIT_COMMIT}.tar.gz"
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