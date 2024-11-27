#! /bin/sh

set -e # set to exit if non-zero return value

set +x
echo "----------------------------------------"
echo "SETUP - common"
echo "----------------------------------------"
set -x

cd common
npm install || exit 1
npm run build || exit 1

set +x
echo "----------------------------------------"
echo "SETUP - backend"
echo "----------------------------------------"
set -x

cd ../backend
npm install || exit 1
npm run build || exit 1

set +x
echo "----------------------------------------"
echo "SETUP - frontend"
echo "----------------------------------------"
set -x

cd ../frontend
npm install || exit 1
npm run build || exit 1

set +x
echo "----------------------------------------"
echo "SETUP - database"
echo "----------------------------------------"
set -x

cd ../database
npm install || exit 1
npm run build || exit 1
npm run new || exit 1
