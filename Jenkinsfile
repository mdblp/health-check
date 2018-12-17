pipeline {
    agent any
    stages {
        stage('Build') { 
            agent {
                docker {
                    image 'node:10.13.0-alpine'           
                }
            }
            steps { 
                sh 'npm install'
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
            when {branch 'master'}
            steps {
                script{
                    timeout(time:30, unit:'MINUTES') {
                        def userInput = input (
                            id: 'userInput',
                            message: "Should we publish?",
                            ok: "Yes, we should.",
                            parameters: [string(name: 'VERSION', defaultValue: '0.1.1', description: 'version of the package?')]
                        )
                        env.version=userInput
                    }
                }
                
                echo "let's package as ${version}."
                //sh "docker tag health-check:latest docker.ci.diabeloop.eu/health-check:${version}"
                //then upload
                withCredentials([usernamePassword(credentialsId: 'nexus-jenkins', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PWD')]) {

                    sh '''
                        docker build -t docker.ci.diabeloop.eu/health-check:${version} -t docker.ci.diabeloop.eu/health-check:latest
                        echo "${NEXUS_PWD}" | docker login -u ${NEXUS_USER} --password-stdin docker.ci.diabeloop.eu
                        docker push docker.ci.diabeloop.eu/health-check:latest
                    '''
                }
            }
        }
    }
    /*
    post {
        failure {
            
        }
    }*/
}