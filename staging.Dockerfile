FROM node:22.2.0-bookworm-slim AS build

WORKDIR /app

COPY . .

RUN apt-get clean all && apt-get update && apt-get upgrade -y
RUN apt-get install -y git

RUN npm ci

RUN npm run build:staging

# Serve Application using Nginx Server

FROM nginx:alpine

COPY .docker/etc/nginx.conf /etc/nginx/nginx.conf
COPY .docker/etc/site.conf /etc/nginx/sites-available/

RUN mkdir -p /etc/nginx/sites-enabled/\
    && ln -s /etc/nginx/sites-available/site.conf /etc/nginx/sites-enabled/

COPY --from=build /app/dist/ /usr/share/nginx/html

EXPOSE 80
