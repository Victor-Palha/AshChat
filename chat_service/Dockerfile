# Etapa 1: Build - Utilizando uma imagem oficial do Elixir
FROM elixir:1.15-alpine AS build

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências necessárias para compilar
RUN mix local.hex --force && \
    mix local.rebar --force && \
    apk add --no-cache build-base git bash

# Copiar o arquivo mix.exs e mix.lock para aproveitar o cache do Docker
COPY mix.exs mix.lock ./

# Instalar as dependências do projeto
RUN mix deps.get

# Copiar o restante dos arquivos do projeto
COPY . .

# Compilar o projeto
RUN mix compile

# Pré-compilar assets (caso você tenha frontend com Phoenix)
RUN mix phx.digest

# Etapa 2: Produção - Utilizando uma imagem mínima para rodar a aplicação
FROM elixir:1.15-alpine AS prod

# Definir diretório de trabalho
WORKDIR /app

COPY --from=build /app/_build/prod/rel /app/_build/prod/rel
COPY --from=build /app/config /app/config
COPY --from=build /app/lib /app/lib
COPY --from=build /app/priv /app/priv

ENV MIX_ENV=prod \
    PORT=4000 \
    PHX_RABBITMQ_HOST=rabbitmq_container_dev \
    PHX_RABBITMQ_USER=root \
    PHX_RABBITMQ_PASSWORD=randompassword \
    PHX_MONGODB_URI=mongodb://root:example@mongodb_container_dev:27017/chats?authSource=admin

# Expor a porta que o Phoenix vai rodar
EXPOSE 4000

# Configuração de execução do aplicativo em produção
CMD ["./_build/prod/rel/chat_service/bin/chat_service", "start"]
