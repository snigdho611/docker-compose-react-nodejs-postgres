FROM node:18
WORKDIR /server
COPY package.json ./
COPY package-lock.json ./
COPY . .
RUN npm install
RUN npx prisma generate
CMD ["npm", "start"]