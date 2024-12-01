#! /bin/bash

iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -d 10.0.0.0/16 -j MASQUERADE
