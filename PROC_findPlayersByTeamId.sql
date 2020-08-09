DELIMITER //
drop procedure if exists findPlayersByTeamId;
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

DELIMITER ;