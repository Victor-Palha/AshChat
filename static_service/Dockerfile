# Etapa 1: Base e dependências
FROM oven/bun:1.1.4 as base

WORKDIR /app

COPY package.json bun.lockb* ./
COPY src ./src

RUN bun install --frozen-lockfile

COPY . .

FROM oven/bun:1.1.4 as runtime

WORKDIR /app

COPY --from=base /app /app

ENV PORT=3006

EXPOSE 3006

CMD ["bun", "run", "src/index.ts"]
