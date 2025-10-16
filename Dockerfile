FROM node:20-alpine3.18 AS base

ENV DIR /app
WORKDIR $DIR
ARG NPM_TOKEN

FROM base AS dev

ENV NODE_ENV=development

COPY package.json yarn.lock .yarnrc.yml ./

RUN corepack enable && \
    echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ".npmrc" && \
    yarn install --immutable && \
    rm -f .npmrc

COPY tsconfig*.json .
COPY .swcrc .
COPY nodemon.json .
COPY src src
COPY playground playground

CMD ["yarn", "dev"]
