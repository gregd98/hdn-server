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
    order by concat(a.lastName, ' ', a.firstName);
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
    where a.eventId = pEventId and a.active = 1
    order by a.startTime, concat(assignedLastName, ' ', assignedFirstName);
end //

-- -----------------------------------------------------------------------------

drop procedure if exists findAllGames2 //
create procedure findAllGames2 (
	in pEventId int
)
begin
	select a.id, a.name, a.location, a.description, a.notes, 
	a.ownerId, b.firstName ownerFirstName, b.lastName ownerLastName,
	a.playerCount, a.startTime, a.endTime
	from Games as a
	join Persons as b
	on a.ownerId = b.id
	where a.eventId = pEventId and a.active = 1
	order by a.startTime, a.name; 
end //

-- -----------------------------------------------------------------------------

drop procedure if exists findGamesByOwnerId //
create procedure findGamesByOwnerId (
	in pUserId int,
    in pEventId int
)
begin
	select a.id, a.name, a.location, a.description, a.notes, 
	a.ownerId, b.firstName ownerFirstName, b.lastName ownerLastName,
	a.playerCount, a.startTime, a.endTime
	from Games as a
	join Persons as b
	on a.ownerId = b.id
	left join Assignments as c
	on a.id = c.gameId
	where a.eventId = pEventId and a.active = 1 and (a.ownerId = pUserId or c.userId = pUserId)
	group by a.id
	order by a.startTime, a.name;
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
    in roleId int,
    in pRegKeyId int,
    in pSingleUse int
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

		if pSingleUse = 1 then
			set @newActive = 0;
		else
			set @newActive = 1;
		end if;
		update RegKeys set used = used + 1, active = @newActive where id = pRegKeyId;
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

drop procedure if exists findGameById //
create procedure findGameById (
	in pId int,
    in pEventId int
)
begin
	select a.id, a.name, a.location, a.description, a.notes, a.ownerId, b.firstName, b.lastName, a.playerCount, a.startTime, a.endTime
	from Games as a
	join Persons as b
	on a.ownerId = b.id
	where a.id = pId and a.eventId = pEventId and a.active = 1;
end //

-- -----------------------------------------------------------------------------

drop procedure if exists findAssignmentsByGameId //
create procedure findAssignmentsByGameId (
	in pGameId int
)
begin
	select a.userId as id, b.firstName, b.lastName
	from Assignments as a
    join Persons as b
    on a.userId = b.id
	where a.gameId = pGameId
    order by concat(b.lastName, ' ', b.firstName);
end //

-- -----------------------------------------------------------------------------

drop procedure if exists deleteAssignmentsByGameId //
create procedure deleteAssignmentsByGameId(
	in pGameId int
)
begin
	delete from Assignments where gameId = pGameId;
end //

-- -----------------------------------------------------------------------------

drop procedure if exists insertAssignment //
create procedure insertAssignment(
	in gameId int,
    in userId int
)
begin
	insert into Assignments (gameId, userId) values (gameId, userId);
end //

-- -----------------------------------------------------------------------------

drop procedure if exists updateGameOwner //
create procedure updateGameOwner(
	in pGameId int,
    in pUserId int
)
begin
	declare exit handler for sqlexception
    begin
        rollback;
        resignal;
    end;
    start transaction;
    delete from Assignments where gameId = pGameId and userId = pUserId;
    update Games set ownerId = pUserId where id = pGameId;
    commit;
end //

-- -----------------------------------------------------------------------------

drop procedure if exists deleteGame //
create procedure deleteGame(
	in pId int
)
begin
	update Games set active = 0 where id = pId;
end //

-- -----------------------------------------------------------------------------

drop procedure if exists updateGame //
create procedure updateGame(
	in pId int,
    in pName nvarchar(32),
	in pLocation nvarchar(32),
	in pDescription nvarchar(1024),
	in pNotes nvarchar(1024),
	in pPlayerCount int,
	in pStartTime datetime,
	in pEndTime datetime
)
begin
	update Games set 
    name = pName,
    location = pLocation,
    description = pDescription,
    notes = pNotes,
    playerCount = pPlayerCount,
    startTime = pStartTime,
    endTime = pEndTime
    where id = pId;
end //

-- -----------------------------------------------------------------------------

drop procedure if exists findScoresByGameId //
create procedure findScoresByGameId(
	in pGameId int
)
begin
	select b.teamId, b.score, b.fairplay
	from Games as a
	join Scores as b
	on a.id = b.gameId
	join Teams as c
	on b.teamId = c.id
	where a.id = pGameId;
end //

-- -----------------------------------------------------------------------------

drop procedure if exists deleteScoreByIds //
create procedure deleteScoreByIds(
	in pGameId int,
    in pTeamId int
)
begin
	delete from Scores where gameId = pGameId and teamId = pTeamId;
end //

-- -----------------------------------------------------------------------------

drop procedure if exists insertScore //
create procedure insertScore(
	in gameId int,
    in teamId int,
    in score int,
    in fairplay bit
)
begin
	insert into Scores (gameId, teamId, score, fairplay) values (gameId, teamId, score, fairplay);
end //

-- -----------------------------------------------------------------------------

drop procedure if exists updateScore //
create procedure updateScore(
	in pGameId int,
    in pTeamId int,
    in pScore int,
    in pFairplay bit
)
begin
	update Scores set score = pScore, fairplay = pFairplay where gameId = pGameId and teamId = pTeamId;
end //

-- -----------------------------------------------------------------------------

drop procedure if exists findAllScores //
create procedure findAllScores(
	in pEventId int
)
begin
	select a.id, a.name, b.teamId, b.score, b.fairplay 
	from Games as a
	left join Scores as b
	on a.id = b.gameId
    where eventId = pEventId
	order by a.id, b.teamId;
end //

-- -----------------------------------------------------------------------------

drop procedure if exists findRegKeyByKey //
create procedure findRegKeyByKey(
	in pRegKey nvarchar(128)
)
begin
    select id, postId, roleId, eventId, singleUse from RegKeys where regKey = pRegKey and active = 1;
end //

-- -----------------------------------------------------------------------------

drop procedure if exists findAllInvitations //
create procedure findAllInvitations()
begin
	select a.id, a.name, a.regKey, a.userId,
	b.firstName, b.lastName, c.name as post, 
	d.name as role, e.name as event, 
	a.singleUse, a.used, a.active
	from RegKeys as a
	join Persons as b
	on a.userId = b.id
	join Posts as c
	on a.postId = c.id
	join Roles as d
	on a.roleId = d.id
	join Events as e
	on a.eventId = e.id
    order by a.id;
end //

-- -----------------------------------------------------------------------------

drop procedure if exists findAllEvents //
create procedure findAllEvents()
begin
	select id, name, firstDay, lastDay from Events;
end //

-- -----------------------------------------------------------------------------

drop procedure if exists findAllPosts //
create procedure findAllPosts()
begin
	select id, name from Posts;
end //

-- -----------------------------------------------------------------------------

drop procedure if exists findAllRoles //
create procedure findAllRoles()
begin
	select id, name from Roles;
end //

-- -----------------------------------------------------------------------------

drop procedure if exists insertRegKey //
create procedure insertRegKey(
	in name nvarchar(16),
    in regKey nvarchar(128),
    in userId int,
    in postId int,
    in roleId int,
    in eventId int,
    in singleUse bit
)
begin
	insert into RegKeys (name, regKey, userId, postId, roleId, eventId, singleUse)
    values (name, regKey, userId, postId, roleId, eventId, singleUse);
end //

-- -----------------------------------------------------------------------------

drop procedure if exists insertEvent //
create procedure insertEvent(
	in name nvarchar(16),
    in firstDay date,
    in lastDay date
)
begin
	insert into Events (name, firstDay, lastDay)
    values (name, firstDay, lastDay);
end //

-- -----------------------------------------------------------------------------

DELIMITER ;