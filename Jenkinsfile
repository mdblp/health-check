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
                stash name: "distrib", includes: "dist/**"
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
                unstash "distrib"
                sh "sh ./qa/package.sh ${version}"
                archiveArtifacts artifacts: 'health-check*.tar.gz'
                //Copy to S3
                s3Upload(file:"health-check-dblp.${version}.tar.gz", bucket:'com.diabeloop.yourloops.ci', path:"deploy/health-check/")
                //And then to nexus
                withCredentials([usernamePassword(credentialsId: 'nexus-jenkins', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PWD')]) {
                    sh '''
                        docker build -t docker.ci.diabeloop.eu/health-check:${version} -t docker.ci.diabeloop.eu/health-check:latest .
                        echo "${NEXUS_PWD}" | docker login -u ${NEXUS_USER} --password-stdin docker.ci.diabeloop.eu
                        docker push docker.ci.diabeloop.eu/health-check:latest
                        docker push docker.ci.diabeloop.eu/health-check:${version}
                    '''
                }
            }
        }
    }
}