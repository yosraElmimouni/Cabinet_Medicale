# Étape de build
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Étape de production avec Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist/medical-clinic-frontend/browser /usr/share/nginx/html
# Copier une configuration nginx personnalisée si nécessaire
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
