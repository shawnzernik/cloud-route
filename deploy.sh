#! /bin/sh

if [ -z "$1" -o -z "$2" -o -z "$3" ]; then
    echo "Use the following syntax:"
    echo "package.sh [host] [user] [pass|pem]"
    exit 1
fi

export HOST="$1"
export USER="$2"
export PASS="$3"

# this is for development - clear out old SSH connections
rm $HOME/.ssh/known_hosts

set +x
echo "========================================"
echo "Cleaning"
echo "========================================"
set -x

./clean.sh
rm setup/cloud-route.zip

set +x
echo "========================================"
echo "Compressing"
echo "========================================"
set -x

zip -r setup/cloud-route.zip . \
#    --exclude ".git/*" \
    --exclude "postgres" \
    --exclude "setup"

set +x
echo "========================================"
echo "Uploading"
echo "========================================"
set -x

if [ -e "$PASS" ]; then
    scp -i $PASS setup/* "$USER@$HOST:~/"
else
    scp setup/* "$USER@$HOST:~/"
fi

set +x
echo "========================================"
echo "Running"
echo "========================================"
set -x

if [ -e "$PASS" ]; then
    ssh $USER@$HOST -i $3 "/bin/bash -c 'sudo -S ./install.sh $USER'"
else
    ssh $USER@$HOST "/bin/bash -c 'echo $PASS | sudo -S ./install.sh $USER'"
fi
