FROM node:slim

ENV NODE_ENV=development\
    DATABASE_URL=\
    DEBUG='web-api'

COPY . .
RUN npm install

EXPOSE 8080

CMD ["./node_modules/.bin/babel-node", "src/index.js"]
