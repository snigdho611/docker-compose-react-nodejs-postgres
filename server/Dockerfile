FROM node:18
# ARG DATABASE_URL="postgresql://john_doe:john.doe@postgres:5432/docker_test_db?schema=public"
# ENV DATABASE_URL=$DATABASE_URL
WORKDIR /server
COPY src/ /server/src
COPY prisma/ /server/prisma
COPY package.json /server/
RUN npm install
RUN npx prisma generate