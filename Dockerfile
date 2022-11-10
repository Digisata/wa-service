FROM node:19-slim

WORKDIR /app

# Install Chromium.
RUN apt-get update \
    && apt-get install -y wget gnupg && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable && \
    rm -rf /var/lib/apt/lists/*s

COPY package*.json ./
RUN npm install

COPY . .

# Run everything after as non-privileged user.
RUN useradd -ms /bin/bash wppuser
USER wppuser

CMD ["npm","start"]