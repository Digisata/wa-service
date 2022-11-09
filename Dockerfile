FROM node:12-slim

# Install Chromium.
RUN apt-get update \
    && apt-get install -y wget gnupg

RUN \
  wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
  echo "deb http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list && \
  apt-get update && \
  apt-get install -y google-chrome-stable && \
  rm -rf /var/lib/apt/lists/*s

RUN npm i whatsapp-web.js && npm i qrcode-terminal

RUN mkdir /app
COPY index.js /app/index.js

# Run everything after as non-privileged user.
RUN useradd -ms /bin/bash wppuser
USER wppuser

CMD ["node","/app/index.js"]