FROM node:10-alpine
ENV NODE_ENV=production
WORKDIR /app

RUN apk --no-cache update && \
    apk --no-cache upgrade && \
    npm install -g npm@latest && \
    chown -R node:node /app 

COPY ./dist .

USER node

CMD ["npm", "start"]
