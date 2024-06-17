FROM node:22.2.0-bookworm-slim AS build

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build:app

# Serve Application using Nginx Server

FROM nginx:alpine

COPY .docker/etc/nginx.conf /etc/nginx/nginx.conf
COPY .docker/etc/site.conf /etc/nginx/sites-available/

RUN mkdir -p /etc/nginx/sites-enabled/\
    && ln -s /etc/nginx/sites-available/site.conf /etc/nginx/sites-enabled/

COPY --from=build /app/dist/ /usr/share/nginx/html

EXPOSE 80
