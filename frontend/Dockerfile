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
# Configuramos Nginx para escuchar en el puerto 8080 que exige Google Cloud Run
RUN sed -i 's/listen  *80;/listen 8080;/g' /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]