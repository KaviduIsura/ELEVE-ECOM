# 1. Start with lightweight Linux/Node environment
FROM node:18-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy dependencies list first (for caching)
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the backend code
COPY . .

# 6. 12-Factor App: Bind to port 5001
EXPOSE 5001

# 7. Start the server
CMD ["npm", "start"]