-- C:\Program Files\MySQL\MySQL Server 8.0\bin>mysqldump.exe -e -u devUser -p hdn -h 127.0.0.1 > C:\backup.sql

drop database if exists hdn;
create database if not exists hdn;
use hdn;

drop table if exists Players;
drop table if exists Sessions;
drop table if exists RegKeys;
drop table if exists Users;
drop table if exists Persons;
drop table if exists ShirtTypes;
drop table if exists ShirtSizes;
drop table if exists Posts;
drop table if exists RolePermissions;
drop table if exists Permissions;
drop table if exists Roles;
drop table if exists Teams;

create table if not exists Events (
	id int auto_increment,
    name nvarchar(16) not null,
    firstDay date not null,
    lastDay date not null,
    
    constraint PK_Events primary key (id),
    constraint UN_Events_name unique (name),
    constraint CH_Events_date check (firstDay < lastDay and datediff(lastDay, firstDay) < 10)
);

create table if not exists Persons (
	id int auto_increment,
    firstName nvarchar(32) not null,
    lastName nvarchar(32) not null,
    phone nvarchar(10) not null,
    email nvarchar(320),
	CNP nvarchar(13) not null,
    eventId int not null,
    
    constraint PK_Persons primary key (id),
    constraint UN_Persons_Phone unique (phone, eventId),
    constraint CH_Person_Phone check (CHAR_LENGTH(phone) >= 10),
    constraint UN_Persons_email unique (email, eventId),
    constraint UN_Persons_CNP unique (CNP, eventId),
    constraint CH_Persons_CNP check (CHAR_LENGTH(CNP) = 13),
    constraint FK_Persons_Events foreign key (eventId) references Events(id)
);

create table if not exists ShirtTypes (
	id int auto_increment,
    name nvarchar(16) not null,
    
    constraint PK_ShirtTypes primary key (id),
    constraint UN_ShirtTypes_name unique (name)
);

create table if not exists ShirtSizes (
	id int auto_increment,
    name nvarchar(16) not null,
    
    constraint PK_ShirtSizes primary key (id),
    constraint UN_ShirtSizes_name unique (name)
);

create table if not exists Posts (
	id int auto_increment,
    name nvarchar(16) not null,
    
    constraint PK_Posts primary key (id),
    constraint UN_Posts_name unique (name)
);

create table if not exists Roles (
	id int auto_increment,
    name nvarchar(16) not null,
    
    constraint PK_Roles primary key (id),
    constraint UN_Roles_name unique (name)
);

create table if not exists Permissions (
	id int auto_increment,
    name nvarchar(32) not null,
    
    constraint PK_Permissions primary key (id),
    constraint UN_Permissions_name unique (name)
);

create table if not exists RolePermissions (
	roleId int not null,
    permissionId int not null,
	
    constraint PK_RolePermissions primary key (roleId, permissionId),
    constraint FK_RolePermissions_Roles foreign key (roleId) references Roles(id),
    constraint FK_RolePermissions_Permissions foreign key (permissionId) references Permissions(id)
);

create table if not exists Users (
	id int not null,
    username nvarchar(32) not null,
    pwdHash nvarchar(128) not null,
    pwdSalt nvarchar(128) not null,
    pwdIterations int not null,
    shirtTypeId int not null,
    shirtSizeId int not null,
    postId int not null,
    roleId int not null,
    
    constraint PK_Users primary key (id),
    constraint FK_Users_Persons foreign key (id) references Persons(id),
    constraint UN_Users_username unique (username),
    constraint CH_Users_username check (CHAR_LENGTH(username) >= 3),
    constraint CH_Users_pwdHash check (CHAR_LENGTH(pwdHash) = 128),
    constraint CH_Users_pwdIterations check (pwdIterations > 0),
    constraint FK_Users_ShirtTypes foreign key (shirtTypeId) references ShirtTypes(id),
    constraint FK_Users_ShirtSizes foreign key (shirtSizeId) references ShirtSizes(id),
    constraint FK_Users_Posts foreign key (postId) references Posts(id),
    constraint FK_Users_Roles foreign key (roleId) references Roles(id)
);

create table if not exists RegKeys (
	id int auto_increment,
    name nvarchar(16) not null,
    regKey nvarchar(128) not null,
    userId int not null,
    postId int not null,
    roleId int not null,
    eventId int not null,
    singleUse bit not null,
    used int not null default 0,
    active bit not null default 1,
    
    constraint PK_RegKeys primary key (id),
    constraint UN_RegKeys_name unique (name),
    constraint UN_RegKeys_regKey unique (regKey),
    constraint FK_RegKeys_Users foreign key (userId) references Users(id),
    constraint FK_RegKeys_Posts foreign key (postId) references Posts(id),
    constraint FK_RegKeys_Roles foreign key (roleId) references Roles(id),
    constraint FK_RegKeys_Events foreign key (eventId) references Events(id),
    constraint CH_RegKeys_uses check (used >= 0)
);

create table if not exists Teams (
	id int auto_increment,
    name nvarchar(32) not null,
    city nvarchar(32) not null,
    eventId int not null,
    
    constraint PK_Teams primary key (id),
    constraint UN_Teams_name unique (name, eventId),
    constraint FK_Teams_Events foreign key (eventId) references Events(id)
);

create table if not exists Players (
	personId int not null,
    teamId int not null,
    rankId int not null,
    
    constraint PK_Players primary key (personId, teamId),
    constraint FK_Players_Persons foreign key (personId) references Persons(id),
    constraint FK_Players_Teams foreign key (teamId) references Teams(id),
    constraint CK_Players_rankId check (rankId >= 0 and rankId <= 2)
);

create table if not exists Sessions (
	id int auto_increment,
    created timestamp default NOW() not null,
    userId int not null,
    sessionId nvarchar(128) not null,
    active bit not null default 1,
    
    constraint PK_Sessions primary key (id),
    constraint FK_Sessions_Users foreign key (userId) references Users(id),
    constraint UN_Sessions unique (userId, sessionId)
);

create table if not exists Games (
	id int auto_increment,
    name nvarchar(32) not null,
    location nvarchar(32),
    description nvarchar(1024),
    notes nvarchar(1024),
    ownerId int not null,
    playerCount int,
    startTime datetime,
    endTime datetime,
    eventId int not null,
    active bit not null default 1,
	
    constraint PK_Games primary key (id),
    constraint UN_Games_name unique (name, eventId),
    constraint FK_Games_Users foreign key (ownerId) references Users(id),
    constraint CH_Games_playerCount check (playerCount >= 0 and playerCount <= 16),
    constraint CH_Games_time check ((startTime is null and endTime is null) or (startTime is not null and endTime is not null and startTime < endTime)),
    constraint FK_Games_Events foreign key (eventId) references Events(id)
);

create table if not exists Scores (
	gameId int not null,
    teamId int not null,
    score int not null,
    fairplay bit not null,
    
    constraint PK_Scores primary key (gameId, teamId),
    constraint FK_Scores_Games foreign key (gameId) references Games(id),
    constraint FK_Scores_Teams foreign key (teamId) references Teams(id),
    constraint CH_Scores_score check (score >= 0)
);

create table if not exists Assignments (
	gameId int not null,
    userId int not null,
    
    constraint PK_Assignments primary key (gameId, userId),
    constraint FK_Assignments_Games foreign key (gameId) references Games(id),
    constraint FK_Assignments_Teams foreign key (userId) references Users(id)
);
    