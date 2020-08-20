DELIMITER //
drop procedure if exists findUserIdBySessionId //
create procedure findUserIdBySessionId (
    in psessionId nvarchar(128)
)
begin
    select a.userId, b.eventId 
	from Sessions as a
	join Persons as b
	on a.userId = b.id
	where sessionId = psessionId and active = 1;
end //

-- -----------------------------------------------------------------------------

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

-- -----------------------------------------------------------------------------

drop procedure if exists findPlayersByTeamId //
create procedure findPlayersByTeamId (
    in paramTeamId int
)
begin
	select b.id, a.rankId, b.lastName, b.firstName, b.phone, b.email, b.cnp 
	from Players as a
	join Persons as b
	on a.personId = b.id
	where a.teamId = paramTeamId
	order by a.rankId desc, concat(b.lastName, ' ', b.firstName) asc;
end //

-- -----------------------------------------------------------------------------

drop procedure if exists findAllUsers //
create procedure findAllUsers (
	in pEventId int
)
begin
	select a.id, b.postId, a.firstName, a.lastName, a.phone, a.email
    from Persons as a
    join Users as b
    on a.id = b.id
    where a.eventId = pEventId
    order by a.lastName;
end //

-- -----------------------------------------------------------------------------

drop procedure if exists findAllTeams //
create procedure findAllTeams (
	in pEventId int
)
begin
	select id, name from Teams
    where eventId = pEventId
    order by name;
end //

-- -----------------------------------------------------------------------------

drop procedure if exists findAllLeaderContacts //
create procedure findAllLeaderContacts (
	in pEventId int
)
begin
	select b.phone, b.email 
    from Players as a 
    join Persons as b 
    on a.personId = b.id 
    where b.eventId = pEventId and a.rankId > 0;
end //

-- -----------------------------------------------------------------------------

drop procedure if exists findTeamById //
create procedure findTeamById (
	in pId int,
    in pEventId int
)
begin
	select id, name, city 
    from Teams 
    where id = pId and eventId = pEventId
    limit 1;
end //

-- -----------------------------------------------------------------------------

drop procedure if exists findAllPlayers //
create procedure findAllPlayers (
	in pEventId int
)
begin
	select b.id, a.rankId, b.lastName, b.firstName, b.phone, b.email, b.cnp 
	from Players as a
	join Persons as b
	on a.personId = b.id
    where b.eventId = pEventId
	order by concat(b.lastName, ' ', b.firstName) asc;
end //

-- -----------------------------------------------------------------------------

drop procedure if exists findPlayerById //
create procedure findPlayerById (
	in pId int,
    in pEventId int
)
begin
	select b.id, a.rankId, b.lastName, b.firstName, b.phone, b.email, b.cnp, c.name team 
	from Players as a
	join Persons as b
	on a.personId = b.id
	join Teams as c
	on a.teamId = c.id
	where b.id = pId and b.eventId = pEventId
	order by concat(b.lastName, ' ', b.firstName)
    limit 1;
end //

-- -----------------------------------------------------------------------------

drop procedure if exists findAllGames //
create procedure findAllGames (
	in pEventId int
)
begin
	select a.id, a.name, a.location, a.description, a.notes, a.ownerId, 
	b.firstName ownerFirstName, b.lastName ownerLastName, 
	a.playerCount, a.startTime, a.endTime, 
	d.id assignedId, d.firstName assignedFirstName, d.lastName assignedLastName
	from Games as a
	join Persons as b
	on a.ownerId = b.id
	left join Assignments as c
	on a.id = c.gameId
	left join Persons as d
	on c.userId = d.id
    where a.eventId = pEventId
    order by a.startTime, concat(assignedLastName, ' ', assignedFirstName);
end //

-- -----------------------------------------------------------------------------

drop procedure if exists insertPerson //
CREATE PROCEDURE insertPerson(
    in firstName nvarchar(32),
    in lastName nvarchar(32),
    in phone nvarchar(10),
    in email nvarchar(320),
    in cnp nvarchar (13),
    in eventId int,
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
    insert into Persons (firstName, lastName, phone, email, cnp, eventId) values (firstName, lastName, phone, email, cnp, eventId);
    set l_account_id = LAST_INSERT_ID();
    if l_account_id > 0 then
		insert into Users (id, username, pwdHash, pwdSalt, pwdIterations, shirtTypeId, shirtSizeId, postId, roleId)
        values (l_account_id, username, pwdHash, pwdSalt, pwdIterations, shirtTypeId, shirtSizeId, postId, roleId);
        commit;
	else
        rollback;
	end if;
END //

-- -----------------------------------------------------------------------------

drop procedure if exists findAllDays //
create procedure findAllDays (
	in pEventId int
)
begin
	declare firstDate date;
	declare lastDate date;
    
    set firstDate = (select firstDay from Events where id = pEventId);
    set lastDate = (select lastDay from Events where id = pEventId);
    
	select selected_date from 
	(select adddate(firstDate, t0.i) selected_date from
	(select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t0) v
	where selected_date between firstDate and lastDate
    order by selected_date;
end //

-- -----------------------------------------------------------------------------

drop procedure if exists findPermissionsByUserId //
create procedure findPermissionsByUserId (
	in pUserId int
)
begin
	select b.permissionId
	from Users as a
	join RolePermissions as b
	on a.roleId = b.roleId
	where a.id = pUserId;
end //

-- -----------------------------------------------------------------------------

drop procedure if exists insertGame //
create procedure insertGame (
	in name nvarchar(32),
	in location nvarchar(32),
	in description nvarchar(1024),
	in notes nvarchar(1024),
	in ownerId int,
	in playerCount int,
	in startTime datetime,
	in endTime datetime,
	in eventId int
)
begin
	insert into Games 
    (name, location, description, notes, ownerId, playerCount, startTime, endTime, eventId)
    values
    (name, location, description, notes, ownerId, playerCount, startTime, endTime, eventId);
end //

-- -----------------------------------------------------------------------------


DELIMITER ;