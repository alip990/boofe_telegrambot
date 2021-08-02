FROM node:15-alpine

WORKDIR /var/app

COPY package*.json .

RUN npm i

COPY . .

EXPOSE 3000


CMD [ "node" "app.js" ]
