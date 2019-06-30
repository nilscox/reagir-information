#!/usr/bin/env sh

getenv() {
  eval "echo \"\$$1\""
}

vardef() {
  for var in "$@"; do
    if [ -z $(getenv "$var") ]; then
      echo "missing $var environment variable" >&2
      exit 1
    fi
  done
}

initialize_env() {
  vardef "DEPLOY_HOSTNAME"
  vardef "PRODUCTION_URL" "STAGING_URL"

  if [ "$ENVIRONMENT" != "staging" -a "$ENVIRONMENT" != "production" ]; then
    echo "usage $0 [staging|production]" >&2
    exit 1
  fi

  if [ -n "$TRAVIS_BUILD_DIR" ]; then
    BUILD_DIR="$TRAVIS_BUILD_DIR"
  fi

  if [ "$ENVIRONMENT" = "staging" ]; then
    DEPLOY_USER="cdv-staging"
    API_URL="$STAGING_URL"
    BASE_URL="$STAGING_URL"
  fi
}

inject_env() {
  echo "injecting environment variables"

  for var in "$@"; do
    filename="$BUILD_DIR/frontend/public/assets/js/bundle.js"
    value=$(getenv "$var")

    vardef "$var"

    echo "- $var=$value"
    sed -i "s/__ENV__${var}__/${value//\//\\/}/g" "$filename"
  done
}

deploy() {
  echo "deploying in $ENVIRONMENT environment"

  ssh "$DEPLOY_USER@$DEPLOY_HOSTNAME" 'rm -rf ~/public'
  scp -r "$BUILD_DIR/frontend/public" "$DEPLOY_USER@$DEPLOY_HOSTNAME:public"

  echo "deployment success!"
  echo "$BASE_URL"
}

ENVIRONMENT="$1"
DEPLOY_USER="cdv"
BUILD_DIR="."

initialize_env
inject_env "NODE_ENV" "API_URL" "BASE_URL" "CHROME_EXTENSION_ID"
deploy