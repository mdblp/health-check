FROM node:10.13.0-alpine

WORKDIR /app

COPY . .

RUN chown -R node /app && export NODE_ENV=production && npm install 

USER node

CMD ["npm", "start"]