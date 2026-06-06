# Etapa 1: Construcción (Empaqueta el código de React)
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Producción (Servidor Nginx ultraligero)
FROM nginx:alpine
# Copiamos la build compilada a la carpeta pública de Nginx
COPY --from=build /app/build /usr/share/nginx/html
# Insertamos nuestra propia configuración de Nginx para soportar React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]