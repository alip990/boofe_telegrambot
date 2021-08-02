FROM node:16-alpine

WORKDIR /var/app

COPY package*.json .

RUN npm i

COPY . .

EXPOSE 3000


CMD [ "node" "app.js" ]
