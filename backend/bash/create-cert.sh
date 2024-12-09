#!/bin/sh

export EASYRSA_BATCH=1
export EASYRSA_DH_KEY_SIZE=2048

set -x
set -e

env

cd /etc/openvpn/easy-rsa

./easyrsa gen-req $1 nopass
./easyrsa sign-req server $1

ls -lAR /etc/openvpn/easy-rsa/pki
if ls /etc/openvpn/easy-rsa/pki/*.pem 1> /dev/null 2>&1; then
    cp -v /etc/openvpn/easy-rsa/pki/*.pem /etc/openvpn/
fi
if ls /etc/openvpn/easy-rsa/pki/*.crt 1> /dev/null 2>&1; then
    cp -v /etc/openvpn/easy-rsa/pki/*.crt /etc/openvpn/
fi
if ls /etc/openvpn/easy-rsa/pki/issued/*.crt 1> /dev/null 2>&1; then
    cp -v /etc/openvpn/easy-rsa/pki/issued/*.crt /etc/openvpn/
fi
if ls /etc/openvpn/easy-rsa/pki/private/*.key 1> /dev/null 2>&1; then
    cp -v /etc/openvpn/easy-rsa/pki/private/*.key /etc/openvpn/
fi
