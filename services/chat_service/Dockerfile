# Find eligible builder and runner images on Docker Hub. We use Ubuntu/Debian
# instead of Alpine to avoid DNS resolution issues in production.
#
# https://hub.docker.com/r/hexpm/elixir/tags?page=1&name=ubuntu
# https://hub.docker.com/_/ubuntu?tab=tags
#
# This file is based on these images:
#
#   - https://hub.docker.com/r/hexpm/elixir/tags - for the build image
#   - https://hub.docker.com/_/debian?tab=tags&page=1&name=bullseye-20241016-slim - for the release image
#   - https://pkgs.org/ - resource for finding needed packages
#   - Ex: hexpm/elixir:1.17.3-erlang-27.1.1-debian-bullseye-20241016-slim
#
ARG ELIXIR_VERSION=1.17.3
ARG OTP_VERSION=27.1.1
ARG DEBIAN_VERSION=bullseye-20241016-slim

ARG BUILDER_IMAGE="hexpm/elixir:${ELIXIR_VERSION}-erlang-${OTP_VERSION}-debian-${DEBIAN_VERSION}"
ARG RUNNER_IMAGE="debian:${DEBIAN_VERSION}"

FROM ${BUILDER_IMAGE} as builder

# Install build dependencies
RUN apt-get update -y && apt-get install -y build-essential git \
    && apt-get clean && rm -f /var/lib/apt/lists/*_*

# Prepare build dir
WORKDIR /app

# Install hex + rebar
RUN mix local.hex --force && \
    mix local.rebar --force

# Set build ENV
ENV MIX_ENV="prod"
ENV PHX_SERVER=true
ENV PHX_RABBITMQ_HOST=${PHX_RABBITMQ_HOST}
ENV PHX_RABBITMQ_USER=${PHX_RABBITMQ_USER}
ENV PHX_RABBITMQ_PASSWORD=${PHX_RABBITMQ_PASSWORD}
ENV PHX_MONGODB_URI=${PHX_MONGODB_URI}
ENV SECRET_KEY_BASE=${SECRET_KEY_BASE}
ENV R2_ACCOUNT_ID=${R2_ACCOUNT_ID}
ENV R2_ENDPOINT_URL=${R2_ENDPOINT_URL}
ENV R2_ACCESS_KEY=${R2_ACCESS_KEY}
ENV R2_SECRET_KEY=${R2_SECRET_KEY}

# Install mix dependencies
COPY mix.exs mix.lock ./
RUN mix deps.get --only $MIX_ENV
RUN mkdir config

# Copy compile-time config files
COPY config/config.exs config/${MIX_ENV}.exs config/
COPY priv /app/priv
RUN mix deps.compile

COPY priv priv
COPY lib lib
# Copy runtime config
COPY config/runtime.exs config/

# Compile the release
RUN MIX_ENV=prod mix compile
RUN mix phx.gen.release
COPY rel rel
RUN MIX_ENV=prod mix release

# Start a new build stage so that the final image will only contain
# the compiled release and other runtime necessities
FROM ${RUNNER_IMAGE}

RUN apt-get update -y && \
  apt-get install -y libstdc++6 openssl libncurses5 locales ca-certificates \
  && apt-get clean && rm -f /var/lib/apt/lists/*_*

# Set the locale
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen

ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

WORKDIR "/app"
RUN chown nobody /app

# Set runner ENV
ENV MIX_ENV="prod"
ENV PHX_SERVER=true
ENV PHX_RABBITMQ_HOST=${PHX_RABBITMQ_HOST}
ENV PHX_RABBITMQ_USER=${PHX_RABBITMQ_USER}
ENV PHX_RABBITMQ_PASSWORD=${PHX_RABBITMQ_PASSWORD}
ENV PHX_MONGODB_URI=${PHX_MONGODB_URI}
ENV SECRET_KEY_BASE=${SECRET_KEY_BASE}
ENV R2_ACCOUNT_ID=${R2_ACCOUNT_ID}
ENV R2_ENDPOINT_URL=${R2_ENDPOINT_URL}
ENV R2_ACCESS_KEY=${R2_ACCESS_KEY}
ENV R2_SECRET_KEY=${R2_SECRET_KEY}


# Only copy the final release from the build stage
COPY --from=builder --chown=nobody:root /app/_build/${MIX_ENV}/rel/chat_service ./

USER nobody

CMD ["/app/bin/server"]