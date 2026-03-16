FROM node:22-alpine
WORKDIR /server
COPY src/ /server/src
COPY prisma/ /server/prisma
COPY package.json /server
COPY tsconfig.json /server
COPY prisma.config.ts /server
RUN npm install
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate dev && npx prisma db seed && npm run build && npm run start"]