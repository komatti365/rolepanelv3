FROM amd64/node:16.20.2-buster as bulider
WORKDIR /opt
ARG CHANNEL_TRACEBACK
ARG CHANNEL_LOG
ARG GUILD_ID
ARG BOT_TOKEN
ENV CHANNEL_TRACEBACK=${CHANNEL_TRACEBACK}
ENV CHANNEL_LOG=${CHANNEL_LOG}
ENV GUILD_ID=${GUILD_ID}
ENV BOT_TOKEN=${BOT_TOKEN}
COPY package.json package-lock.json tsconfig.json ./
COPY ./prisma ./prisma
COPY ./src ./src

RUN npm set-script postinstall "" && npm i && npm run build:tsc

FROM node:16.20.2-buster-slim

RUN apt update && apt install -y --no-install-recommends \
      openssl \
     && apt-get clean \
     && rm -rf /var/lib/apt/lists/*

WORKDIR /opt
COPY package.json package-lock.json ./
COPY ./prisma ./prisma
RUN npm set-script postinstall "" && npm i --production && npm run build:prisma
COPY --from=bulider /opt/out /opt/out
CMD ["node", "out/index.js"]

