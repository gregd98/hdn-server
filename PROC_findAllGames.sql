DELIMITER //
drop procedure if exists findAllGames;
create procedure findAllGames()
begin
	select a.id, a.name, a.description, a.notes, a.ownerId, 
	b.firstName ownerFirstName, b.lastName ownerLastName, 
	a.playerCount, a.maxScore, a.startTime, a.endTime, 
	d.id assignedId, d.firstName assignedFirstName, d.lastName assignedLastName
	from Games as a
	join Persons as b
	on a.ownerId = b.id
	left join Assignments as c
	on a.id = c.gameId
	left join Persons as d
	on c.userId = d.id
    order by a.id, concat(assignedLastName, ' ', assignedFirstName);
end //

DELIMITER ;