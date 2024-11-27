FROM node:latest

WORKDIR /app

COPY ./common ./common
COPY ./backend ./backend
COPY ./frontend ./frontend

WORKDIR /app/common
RUN npm install
RUN npm run build

WORKDIR /app/backend
RUN npm install
RUN npm run build

WORKDIR /app/frontend
RUN npm install
RUN npm run build

WORKDIR /app/backend

EXPOSE 4433

CMD ["npm", "run", "run"]