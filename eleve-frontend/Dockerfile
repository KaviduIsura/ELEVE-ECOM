# STAGE 1: Build the React App
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# STAGE 2: Serve with Nginx
FROM nginx:alpine
# Copy the built files from Stage 1 into Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy custom NGINX configuration for React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]