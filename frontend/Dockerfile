FROM node:20-alpine

WORKDIR /app

# Enable polling cho file watching trong Docker (cần cho hot reload)
ENV CHOKIDAR_USEPOLLING=true

# Copy package files trước để tận dụng Docker layer cache
COPY package.json package-lock.json ./

# Cài đặt dependencies
RUN npm ci --prefer-offline --no-audit

# Copy source code
COPY . .

# Expose port cho Vite dev server
EXPOSE 5173

# Start dev server với hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
