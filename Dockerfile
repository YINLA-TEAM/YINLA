FROM node:20.17.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# 安裝 Puppeteer 及其依賴
RUN apt-get update && apt-get install curl gnupg -y \
    && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install google-chrome-stable -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 複製專案檔案
COPY src/ /bot/src/
COPY package.json .env /bot/

# 設定工作目錄
WORKDIR /bot

# 安裝 Node.js 套件
RUN npm install && npm cache clean --force

# 設定 Puppeteer 使用無頭模式
CMD ["node", "src/index.js"]