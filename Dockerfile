FROM node:13.13.0
WORKDIR /usr/src/BE
EXPOSE 8000
COPY . .
RUN npm install
CMD [ "npm", "run", "start" ]