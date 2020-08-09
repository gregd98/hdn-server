DELIMITER //
drop procedure if exists findAllPlayers;
create procedure findAllPlayers ()
begin
	select b.id, a.rankId, b.lastName, b.firstName, b.phone, b.email, b.cnp 
	from Players as a
	join Persons as b
	on a.personId = b.id
	order by concat(b.lastName, ' ', b.firstName) asc;
end //

DELIMITER ;