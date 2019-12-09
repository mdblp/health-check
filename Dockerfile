FROM node:10.15-alpine

RUN apk --no-cache update
RUN apk --no-cache upgrade
RUN apk add python make

WORKDIR /app

COPY . .

RUN chown -R node /app
RUN NODE_ENV=production npm install

USER node

CMD ["npm", "start"]
