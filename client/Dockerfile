FROM node:18
ARG VITE_SERVER_URL=http://127.0.0.1:7999
ENV VITE_SERVER_URL=$VITE_SERVER_URL
WORKDIR /client
COPY public/ /client/public
COPY src/ /client/src
COPY index.html /client/
COPY package.json /client/
COPY tsconfig.app.json /client/
COPY tsconfig.json /client/
COPY tsconfig.node.json /client/
COPY vite.config.ts /client/
RUN npm install
RUN npm run build