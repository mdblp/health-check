FROM node:10-alpine
ARG npm_token
ENV NEXUS_TOKEN=$npm_token
ENV NODE_ENV=production
WORKDIR /app

RUN apk --no-cache update && \
    apk --no-cache upgrade && \
    apk add --no-cache --virtual .build-dependencies python make && \
    npm install -g npm@latest && \
    chown -R node:node /app 

COPY . .

RUN npm install && \
    npm cache clean --force && \
    apk del .build-dependencies

USER node

CMD ["npm", "start"]
