INSERT INTO lists (guid,title,url_key,top_menu_guid,left_menu_guid,"sql",edit_url,autoload) VALUES
	 ('40fa2208-759b-47ca-8485-20a56e9d5465'::uuid,'Content List','contents','b1e3c680-0f62-4931-8a68-4be9b4b070f7'::uuid,'527f06a9-0378-47c6-9b16-a9c0b72c757e'::uuid,'SELECT
	c.guid,
	c.path_and_name AS "Name",
	c.mime_type  AS "Type",
	c.encoded_size AS "Size",
	CASE 
		WHEN c.modified IS NOT NULL THEN c.modified
		ELSE c.created
	END AS "Changed",
	CASE 
		WHEN c.modified IS NOT NULL THEN mu.email_address
		ELSE cu.email_address
	END AS "Changed By",
	c.deleted AS "Deleted",
	du.email_address AS "Deleted By"
FROM 
	contents c
	LEFT JOIN users cu ON cu.guid = c.created_by 
	LEFT JOIN users mu ON mu.guid = c.modified_by
	LEFT JOIN users du ON du.guid = c.deleted_by
ORDER BY
	c.path_and_name','/static/tre/pages/content.html',true);

INSERT INTO list_filters (guid,lists_guid,"label",sql_column,sql_type,options_sql,default_compare,default_value) VALUES
	 ('5613612d-2e74-4165-a454-039addfd29ca'::uuid,'40fa2208-759b-47ca-8485-20a56e9d5465'::uuid,'Name','Name','varchar','','c',''),
	 ('1e124d7b-5872-437e-84b5-e07abe3c294e'::uuid,'40fa2208-759b-47ca-8485-20a56e9d5465'::uuid,'Changed','Changed','timestamp','','gt',''),
	 ('4219eed9-0a58-4503-abff-4acb172661cf'::uuid,'40fa2208-759b-47ca-8485-20a56e9d5465'::uuid,'Type','Type','varchar','','c',''),
	 ('3887fd89-655b-4a47-b876-0a0def75d959'::uuid,'40fa2208-759b-47ca-8485-20a56e9d5465'::uuid,'Size','Size','int','','gte',''),
	 ('2317ecf5-3302-4ee7-ae4f-0d45fde42f8c'::uuid,'40fa2208-759b-47ca-8485-20a56e9d5465'::uuid,'Changed By','Changed By','varchar','','c',''),
	 ('7c5643b8-d079-4d1e-8e67-6cb8a010a6e8'::uuid,'40fa2208-759b-47ca-8485-20a56e9d5465'::uuid,'Deleted By','Deleted By','varchar','','c',''),
	 ('fbcd7ac2-99d4-4eb4-9c1c-97f90a601acd'::uuid,'40fa2208-759b-47ca-8485-20a56e9d5465'::uuid,'Deleted','Deleted','timestamp','','gt','');
