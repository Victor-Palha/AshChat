source load_env.sh
cd ..
mix deps.get --only prod
MIX_ENV=prod mix compile
mix phx.gen.release
MIX_ENV=prod mix release