CREATE TABLE "cr_adapters" (
    "guid" UUID PRIMARY KEY,

    "display_name" VARCHAR(250) NOT NULL,
    "device_name" VARCHAR(250) NOT NULL UNIQUE,

    "enable" BOOLEAN NOT NULL,

    "ip4_address" VARCHAR(15),
    "ip4_network_bits" INT NOT NULL,
    "ip4_default_gateway" VARCHAR(15),
    "ip4_dns_addresses" VARCHAR(100),
    "dns_search" VARCHAR(250)
);