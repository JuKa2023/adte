FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM alpine:3.20
ARG PB_VERSION=0.28.3
ENV PB_VERSION=${PB_VERSION}

RUN apk add --no-cache ca-certificates unzip

ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb \
 && chmod +x /pb/pocketbase \
 && rm /tmp/pb.zip

COPY pb_migrations /pb/pb_migrations
COPY pb_hooks /pb/pb_hooks
COPY --from=builder /app/dist/ /pb/pb_public/

WORKDIR /pb
EXPOSE 80
CMD ["./pocketbase", "serve", "--http=0.0.0.0:80"]