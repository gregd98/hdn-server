insert into ShirtTypes (name) values ('male'), ('female');
insert into ShirtSizes (name) values ('XXS'), ('XS'), ('S'), ('M'), ('L'), ('XL'), ('XXL');
insert into Posts (name) values ('organizer'), ('volunteer');
insert into Roles (name) values ('volunteer'), ('organizer'), ('content_admin'), ('system_admin');
insert into Permissions (name) values ('TEAMS_DATA_ACCES');
insert into RolePermissions (roleId, permissionId) values (4, 1);
insert into Persons (firstName, lastName, phone, email, CNP) values ('Gergely', 'Demény', '0787318451', 'gergodemeny@gmail.com', '1981003142618');
insert into Users (id, username, pwdHash, pwdSalt, pwdIterations, shirtTypeId, shirtSizeId, postId, roleId) values 
(1, 'greg', '1b7f7d90f9aee0d129a6906280a67b60c15e73e2362508bda5df3186dc1ecb66c4560454308201d42db220b144a3d7b3aea35945f71eee4896475834a88d1c4a', 
'whZfZtU8FZOLOKf5L1BOBwDWdjdT5pM+nyd+5VHynB/VtsfzuVb7b8tpuRC6SrGMsc65+okub59Udfqt9bUJYA==', 10000, 1, 1, 1, 4);
