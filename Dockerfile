FROM node:14-alpine

WORKDIR /var/app

COPY package*.json .

RUN npm i

COPY . .

EXPOSE 3000


CMD [ "node" "app.js" ]
