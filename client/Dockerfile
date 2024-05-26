FROM node:18
ARG VITE_SERVER_URL=http://127.0.0.1:7999
ENV VITE_SERVER_URL=$VITE_SERVER_URL
WORKDIR /client
COPY package.json ./
COPY package-lock.json ./
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "run", "preview"]