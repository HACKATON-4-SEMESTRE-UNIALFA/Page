# Utilizar imagem oficial do Node.js
FROM node:18-alpine

# Diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copiar arquivos package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante do código para o container
COPY . .

# Expor a porta padrão do React
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "start"]
