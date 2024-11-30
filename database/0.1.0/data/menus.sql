CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

INSERT INTO "menus" ("guid", "parents_guid", "order", "display", "bootstrap_icon", "url") VALUES
    ('ce40996d-0a86-493c-b0f4-06bb45e312c8', NULL, 10, 'Router', 'router-fill', ''),
    ('1094e878-7c5b-47c0-b8cf-076f1983c01f', 'ce40996d-0a86-493c-b0f4-06bb45e312c8', 1, 'System', 'gear-fill', '/static/app/pages/system.html'),
    ('01ae2cfa-8ed9-4b7e-b990-b5f9e947e29b', 'ce40996d-0a86-493c-b0f4-06bb45e312c8', 2, 'Adapters', 'plug-fill', '/static/app/pages/adapters.html'),
    ('4912387d-c711-4399-a73e-15d41af06936', 'ce40996d-0a86-493c-b0f4-06bb45e312c8', 3, 'Firewall', 'fire', '/static/app/pages/firewall.html'),
    ('2109d56f-5219-493f-9bf6-516e2d423f93', 'ce40996d-0a86-493c-b0f4-06bb45e312c8', 4, 'NAT', 'shuffle', '/static/app/pages/nat.html'),
    ('8ad8c7ac-73f6-48e7-b4b6-929cde2b50b5', 'ce40996d-0a86-493c-b0f4-06bb45e312c8', 5, 'Routes', 'signpost-split', '/static/app/pages/routes.html'),
    ('44596222-4db4-4f3f-aef5-35e118a29d87', 'ce40996d-0a86-493c-b0f4-06bb45e312c8', 6, 'OpenVPN', 'shield-lock-fill', '/static/app/pages/openvpn.html');

INSERT INTO "securables" ("guid", "display_name")
SELECT 
    m.guid,
    CASE
        WHEN m.parents_guid IS NULL THEN CONCAT('Menu:', m.display)
        ELSE CONCAT(
            'Menu:Item:',
            COALESCE(
                (SELECT p.display FROM "menus" p WHERE m.parents_guid = p.guid LIMIT 1),
                'MISSING'
            ),
            ':',
            m.display
        )
    END
FROM "menus" m
WHERE 
    m.guid NOT IN ( SELECT "guid" from "securables" )