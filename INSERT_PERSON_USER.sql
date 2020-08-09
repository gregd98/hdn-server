DELIMITER //
drop procedure if exists insertPerson;
CREATE PROCEDURE insertPerson(
    in firstName nvarchar(32),
    in lastName nvarchar(32),
    in phone nvarchar(10),
    in email nvarchar(320),
    in cnp nvarchar (13),
    in username nvarchar(32),
    in pwdHash nvarchar(128),
    in pwdSalt nvarchar(128),
    in pwdIterations int,
    in shirtTypeId int,
    in shirtSizeId int,
    in postId int,
    in roleId int
)
BEGIN
	declare l_account_id int default 0;    
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

	start transaction;
    insert into Persons (firstName, lastName, phone, email, cnp) values (firstName, lastName, phone, email, cnp);
    set l_account_id = LAST_INSERT_ID();
    if l_account_id > 0 then
		insert into Users (id, username, pwdHash, pwdSalt, pwdIterations, shirtTypeId, shirtSizeId, postId, roleId)
        values (l_account_id, username, pwdHash, pwdSalt, pwdIterations, shirtTypeId, shirtSizeId, postId, roleId);
        commit;
	else
        rollback;
	end if;
END //
DELIMITER ;
