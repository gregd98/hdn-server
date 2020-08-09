DELIMITER //
drop procedure if exists checkUserPermission;
create procedure checkUserPermission (
    in paramUserId int,
    in paramPermissionId int
)
begin
	select count(*) as result from Users as a
	join RolePermissions as b
	on a.roleId = b.roleId
	where a.id = paramUserId and b.permissionId = paramPermissionId;
end //

DELIMITER ;