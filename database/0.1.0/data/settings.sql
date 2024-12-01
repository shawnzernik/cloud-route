INSERT INTO settings (guid, key, value) 
VALUES (
    'ef17399e-12bb-4009-acf7-89e0713cb635',
    'OpenVPN:JSON',
    '{
        "caCity": "Lago Vista",
        "caProvince": "Texas",
        "caCountry": "USA",
        "caOrganization": "Lago Vista Technologies LLC",
        "caOrgUnit": "Informatoin Technology",
        "caEmail": "noemail@lagovistatech.com",
        "caCnHostName": "ca.lagovistatech.com",
        "clientNetwork": "10.0.1.0",
        "clientNetworkBits": 24,
        "clinetNetworkType": "nat",
        "exposedNetwork": "10.0.4.0",
        "exposedNetworkBits": 22,
        "exposedDns": "8.8.8.8",
        "serverCnHostName": "openvpn.lagovistatech.com",
        "serverPort": 1194,
        "serverProtocol": "udp"
    }'
);