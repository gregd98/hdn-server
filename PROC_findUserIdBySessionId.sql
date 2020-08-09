DELIMITER //
drop procedure if exists findUserIdBySessionId;
create procedure findUserIdBySessionId (
    in psessionId nvarchar(128)
)
begin
	select userId from Sessions where sessionId = psessionId and active = 1;
end //

DELIMITER ;