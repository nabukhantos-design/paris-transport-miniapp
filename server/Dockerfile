FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY src ./src
COPY .env.example ./.env.example
ENV PORT=8080
EXPOSE 8080
CMD ["npm","start"]
