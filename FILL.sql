insert into Events (name, firstDay, lastDay) values ('HDN 2020', '2020-08-14', '2020-08-16');
insert into ShirtTypes (name) values ('male'), ('female');
insert into ShirtSizes (name) values ('XXS'), ('XS'), ('S'), ('M'), ('L'), ('XL'), ('XXL');
insert into Posts (name) values ('organizer'), ('volunteer');
insert into Roles (name) values ('volunteer'), ('organizer'), ('content_admin'), ('system_admin');
insert into Permissions (name) values ('TEAMS_DATA_ACCESS'), ('ADD_GAME'), ('ALL_GAME_ACCESS'), ('ALL_GAME_ADMIN'), ('EDIT_ASSIGNED_GAME'), ('SCORE_TABLE_ACCESS');
insert into RolePermissions (roleId, permissionId) values (2, 1), (2, 2), (2, 3), (4, 1), (4, 2), (4, 3), (4, 4), (2, 5), (4, 5), (4, 6);

insert into Persons (firstName, lastName, phone, email, CNP, eventId) values ('Gergely', 'Demény', '0787318451', 'gergodemeny@gmail.com', '1981003142618', 1);
insert into Users (id, username, pwdHash, pwdSalt, pwdIterations, shirtTypeId, shirtSizeId, postId, roleId) values 
(1, 'greg', '1b7f7d90f9aee0d129a6906280a67b60c15e73e2362508bda5df3186dc1ecb66c4560454308201d42db220b144a3d7b3aea35945f71eee4896475834a88d1c4a', 
'whZfZtU8FZOLOKf5L1BOBwDWdjdT5pM+nyd+5VHynB/VtsfzuVb7b8tpuRC6SrGMsc65+okub59Udfqt9bUJYA==', 10000, 1, 1, 1, 4);

insert into Persons (firstName, lastName, phone, email, CNP, eventId) values ('One', 'Organizer', '0711111111', 'org1@gmail.com', '6200804016926', 1);
insert into Users (id, username, pwdHash, pwdSalt, pwdIterations, shirtTypeId, shirtSizeId, postId, roleId) values 
(2, 'org1', '1b7f7d90f9aee0d129a6906280a67b60c15e73e2362508bda5df3186dc1ecb66c4560454308201d42db220b144a3d7b3aea35945f71eee4896475834a88d1c4a', 
'whZfZtU8FZOLOKf5L1BOBwDWdjdT5pM+nyd+5VHynB/VtsfzuVb7b8tpuRC6SrGMsc65+okub59Udfqt9bUJYA==', 10000, 1, 1, 1, 2);

insert into Persons (firstName, lastName, phone, email, CNP, eventId) values ('Two', 'Organizer', '0722222222', 'org2@gmail.com', '6200804017055', 1);
insert into Users (id, username, pwdHash, pwdSalt, pwdIterations, shirtTypeId, shirtSizeId, postId, roleId) values 
(3, 'org2', '1b7f7d90f9aee0d129a6906280a67b60c15e73e2362508bda5df3186dc1ecb66c4560454308201d42db220b144a3d7b3aea35945f71eee4896475834a88d1c4a', 
'whZfZtU8FZOLOKf5L1BOBwDWdjdT5pM+nyd+5VHynB/VtsfzuVb7b8tpuRC6SrGMsc65+okub59Udfqt9bUJYA==', 10000, 1, 1, 1, 2);

insert into Persons (firstName, lastName, phone, email, CNP, eventId) values ('Three', 'Organizer', '0733333333', 'org3@gmail.com', '6200804019235', 1);
insert into Users (id, username, pwdHash, pwdSalt, pwdIterations, shirtTypeId, shirtSizeId, postId, roleId) values 
(4, 'org3', '1b7f7d90f9aee0d129a6906280a67b60c15e73e2362508bda5df3186dc1ecb66c4560454308201d42db220b144a3d7b3aea35945f71eee4896475834a88d1c4a', 
'whZfZtU8FZOLOKf5L1BOBwDWdjdT5pM+nyd+5VHynB/VtsfzuVb7b8tpuRC6SrGMsc65+okub59Udfqt9bUJYA==', 10000, 1, 1, 1, 2);

insert into Persons (firstName, lastName, phone, email, CNP, eventId) values ('One', 'Volunteer', '0744444444', 'vol1@gmail.com', '6200804017514', 1);
insert into Users (id, username, pwdHash, pwdSalt, pwdIterations, shirtTypeId, shirtSizeId, postId, roleId) values 
(5, 'vol1', '1b7f7d90f9aee0d129a6906280a67b60c15e73e2362508bda5df3186dc1ecb66c4560454308201d42db220b144a3d7b3aea35945f71eee4896475834a88d1c4a', 
'whZfZtU8FZOLOKf5L1BOBwDWdjdT5pM+nyd+5VHynB/VtsfzuVb7b8tpuRC6SrGMsc65+okub59Udfqt9bUJYA==', 10000, 1, 1, 2, 1);

insert into Persons (firstName, lastName, phone, email, CNP, eventId) values ('Two', 'Volunteer', '0755555555', 'vol2@gmail.com', '6200804017901', 1);
insert into Users (id, username, pwdHash, pwdSalt, pwdIterations, shirtTypeId, shirtSizeId, postId, roleId) values 
(6, 'vol2', '1b7f7d90f9aee0d129a6906280a67b60c15e73e2362508bda5df3186dc1ecb66c4560454308201d42db220b144a3d7b3aea35945f71eee4896475834a88d1c4a', 
'whZfZtU8FZOLOKf5L1BOBwDWdjdT5pM+nyd+5VHynB/VtsfzuVb7b8tpuRC6SrGMsc65+okub59Udfqt9bUJYA==', 10000, 1, 1, 2, 1);

insert into Persons (firstName, lastName, phone, email, CNP, eventId) values ('Three', 'Volunteer', '0766666666', 'vol3@gmail.com', '6200804015991', 1);
insert into Users (id, username, pwdHash, pwdSalt, pwdIterations, shirtTypeId, shirtSizeId, postId, roleId) values 
(7, 'vol3', '1b7f7d90f9aee0d129a6906280a67b60c15e73e2362508bda5df3186dc1ecb66c4560454308201d42db220b144a3d7b3aea35945f71eee4896475834a88d1c4a', 
'whZfZtU8FZOLOKf5L1BOBwDWdjdT5pM+nyd+5VHynB/VtsfzuVb7b8tpuRC6SrGMsc65+okub59Udfqt9bUJYA==', 10000, 1, 1, 2, 1);
