#!/bin/sh

export EASYRSA_BATCH=1
export EASYRSA_DH_KEY_SIZE=2048

set -x
set -e

env

if [ -d /etc/openvpn/easy-rsa ]; then
    rm -R /etc/openvpn/easy-rsa
    if ls /etc/openvpn/*.pem 1> /dev/null 2>&1; then
        rm /etc/openvpn/*.pem
    fi
    if ls /etc/openvpn/*.crt 1> /dev/null 2>&1; then
        rm /etc/openvpn/*.crt
    fi
    if ls /etc/openvpn/*.key 1> /dev/null 2>&1; then
        rm /etc/openvpn/*.key
    fi
fi

make-cadir /etc/openvpn/easy-rsa

cd /etc/openvpn/easy-rsa

./easyrsa init-pki
./easyrsa build-ca nopass
./easyrsa gen-dh

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

cd /etc/openvpn

openvpn --genkey secret ta.key