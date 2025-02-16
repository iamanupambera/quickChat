FROM node:20

# RUN apt-get update
# RUN apt-get install -y libcairo2-dev libpoppler-qt5-dev poppler-data zip

WORKDIR /api
COPY package*.json /api
RUN npm i -g @nestjs/cli
RUN npm install
COPY . /api

ENTRYPOINT ["npm", "run"]
