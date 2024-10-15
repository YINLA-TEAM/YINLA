FROM node:20.17.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

ENV TZ=Asia/Taipei
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY src/ /bot/src/
COPY package.json /bot/

WORKDIR /bot

RUN npm install && npm cache clean --force

CMD ["node", "src/index.js"]