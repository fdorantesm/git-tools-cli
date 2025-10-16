FROM node:24-alpine3.20 AS base

ENV DIR /app
WORKDIR $DIR
ARG NPM_TOKEN

FROM base AS dev

ENV NODE_ENV=development

COPY package.json yarn.lock ./

RUN corepack enable && \
    corepack prepare yarn@1.22.22 --activate && \
    echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ".npmrc" && \
    yarn install --frozen-lockfile && \
    rm -f .npmrc

COPY tsconfig*.json .
COPY .swcrc .
COPY nodemon.json .
COPY src src
COPY playground playground

CMD ["yarn", "dev"]
