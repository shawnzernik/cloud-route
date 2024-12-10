#!/bin/sh

set -x
set -e

env

cat ./templates/etc/sysctl.conf >> sysctl.conf
sysctl -p /etc/sysctl.conf

mv ../temp/openvpn-nat.sh /usr/local/bin/openvpn-nat.sh
chmod +x /usr/local/bin/openvpn-nat.sh

mv ../temp/server.conf /etc/openvpn/server.conf
chmod 600 /etc/openvpn/server.conf

mv ../temp/openvpn-nat.service /etc/systemd/system/openvpn-nat.service
chmod 660 /etc/systemd/system/openvpn-nat.service

set +e
systemctl enable openvpn-nat
systemctl stop openvpn-nat
set -e
systemctl start openvpn-nat

set +e
systemctl enable openvpn@server
systemctl stop openvpn@server
set -e
systemctl start openvpn@server
