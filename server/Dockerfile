FROM node:22-alpine
WORKDIR /server
COPY . .
RUN npm install
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npx prisma db seed && npm run start"]