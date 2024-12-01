#! /bin/sh

if [ -z "$1" ]; then
    echo "Use the following syntax:"
    echo "install.sh user"
    exit 1
fi

export USER=$1

if [ ! -f "cloud-route.zip" ]; then
    echo "Missing file 'cloud-route.zip'!"
    exit 1
fi

rm -R /opt/cloud-route

set -e # set to exit if non-zero return value

set +x
echo "========================================"
echo "Installing NodeJS"
echo "========================================"
set -x

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

sudo apt install -y postgresql vim unzip zip

set +x
echo "========================================"
echo "Installing OpenVPN"
echo "========================================"
set -x

sudo apt install -y openvpn easy-rsa iptables
sudo make-cadir /etc/openvpn/easy-rsa

set +x
echo "========================================"
echo "Configuring postgresql"
echo "========================================"
set -x

cp /home/$USER/postgresql.conf /etc/postgresql/16/main/postgresql.conf
cp /home/$USER/pg_hba.conf /etc/postgresql/16/main/pg_hba.conf

systemctl restart postgresql

sudo -u postgres psql postgres -c "ALTER USER postgres with encrypted password 'postgres';"

set +x
echo "========================================"
echo "Extracting cloud route"
echo "========================================"
set -x

mkdir /opt/cloud-route
cd /opt/cloud-route
unzip /home/$USER/cloud-route.zip

chmod +x *.sh

./setup.sh

set +x
echo "========================================"
echo "Setting up service"
echo "========================================"
set -x

cd /home/$USER
cp /home/$USER/cloud-route.service /etc/systemd/system/cloud-route.service
sudo systemctl daemon-reload
sudo systemctl enable cloud-route
sudo systemctl start cloud-route
sudo systemctl status cloud-route

set +x
echo "========================================"
echo "Making administrator not need password to sudo"
echo "========================================"
set -x
echo "administrator ALL=(ALL:ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/administrator