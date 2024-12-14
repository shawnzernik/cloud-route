#! /bin/sh

if [ -z "$1" ]; then
    echo "Use the following syntax:"
    echo "install.sh user"
    exit 1
fi

export USER=$1

rm -R /opt/cloud-route

set -e # set to exit if non-zero return value

set +x
echo "========================================"
echo "Making administrator not need password to sudo"
echo "========================================"
set -x
pwd

echo "administrator ALL=(ALL:ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/administrator

set +x
echo "========================================"
echo "Updating ubuntu"
echo "========================================"
set -x
pwd

sudo apt-get update
sudo apt-get -y upgrade

set +x
echo "========================================"
echo "sleeping 10 seconds"
echo "========================================"
set -x
pwd

sleep 10

set +x
echo "========================================"
echo "Installing NodeJS"
echo "========================================"
set -x
pwd

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
node -v
npm -v

set +x
echo "========================================"
echo "Installing postgres, vim, and zip"
echo "========================================"
set -x
pwd

sudo apt-get install -y postgresql vim unzip zip
# the following is for development
sudo apt-get install -y git

set +x
echo "========================================"
echo "Installing OpenVPN"
echo "========================================"
set -x
pwd

sudo apt-get install -y openvpn easy-rsa iptables

if [ ! -d "/etc/openvpn/easy-rsa" ]; then
    sudo make-cadir /etc/openvpn/easy-rsa
fi

set +x
echo "========================================"
echo "Installing cloud-route"
echo "========================================"
set -x
pwd

sudo git clone https://github.com/shawnzernik/cloud-route.git /opt/cloud-route

set +x
echo "========================================"
echo "Configuring postgresql"
echo "========================================"
set -x
pwd

sudo cp /opt/cloud-route/vm-setup/postgresql.conf /etc/postgresql/16/main/postgresql.conf
sudo cp /opt/cloud-route/vm-setup/pg_hba.conf /etc/postgresql/16/main/pg_hba.conf

sudo systemctl restart postgresql

sudo -u postgres psql postgres -c "ALTER USER postgres with encrypted password 'postgres';"

set +x
echo "========================================"
echo "Setting up cloud route"
echo "========================================"
set -x
pwd

cd /opt/cloud-route
chmod +x *.sh
./setup.sh

set +x
echo "========================================"
echo "Setting up service"
echo "========================================"
set -x
pwd

cd /opt/cloud-route/vm-setup
cp /opt/cloud-route/vm-setup/cloud-route.service /etc/systemd/system/cloud-route.service
sudo systemctl daemon-reload
sudo systemctl enable cloud-route
sudo systemctl restart cloud-route
sudo systemctl status cloud-route