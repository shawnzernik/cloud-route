#! /bin/sh

set -x
set -e

env

cp /etc/openvpn/ta.key $1/ta.key
cp /etc/openvpn/ca.crt $1/ca.crt
cp /etc/openvpn/$2 $1/client.crt
cp /etc/openvpn/$3 $1/client.key

chmod ugo+r $1/*

cd $1
zip ../$1.zip ./*
