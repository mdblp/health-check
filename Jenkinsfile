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
                sh 'docker build --tag health-check:latest .'
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
                sh "docker tag health-check:latest docker.ci.diabeloop.eu/health-check:${version}"
                //then upload
                withCredentials([usernamePassword(credentialsId: 'nexus-jenkins', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PWD')]) {

                    sh '''
                        echo ${NEXUS_PWD} | docker login -u ${NEXUS_USER} docker.ci.diabeloop.eu
                        docker push docker.ci.diabeloop.eu/health-check:${version}
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