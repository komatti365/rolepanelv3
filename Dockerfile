FROM amd64/node:16.20.2-buster as bulider
WORKDIR /opt

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

