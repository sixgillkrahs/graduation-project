#!/bin/sh
set -e

if [ "${RUN_STARTUP_SEEDS:-true}" = "true" ]; then
  echo "Running startup seeds..."
  npm run seed:bootstrap
else
  echo "Skipping startup seeds."
fi

exec npm start
