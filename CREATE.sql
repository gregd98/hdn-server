drop table if exists Players;
drop table if exists Sessions;
drop table if exists Users;
drop table if exists Persons;
drop table if exists ShirtTypes;
drop table if exists ShirtSizes;
drop table if exists Posts;
drop table if exists Roles;
drop table if exists Teams;

create table if not exists Persons (
	id int auto_increment,
    firstName nvarchar(32) not null,
    lastName nvarchar(32) not null,
    phone nvarchar(12) not null,
    email nvarchar(320),
	CNP nvarchar(13) not null,
    
    constraint PK_Persons primary key (id),
    constraint UN_Persons_Phone unique (phone),
    constraint CH_Person_Phone check (CHAR_LENGTH(phone) >= 10),
    constraint UN_Persons_email unique (email),
    constraint UN_Persons_CNP unique (CNP),
    constraint CH_Persons_CNP check (CHAR_LENGTH(CNP) = 13)
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

create table if not exists Users (
	id int auto_increment,
    personId int,
    username nvarchar(32) not null,
    pwdHash nvarchar(128) not null,
    pwdSalt nvarchar(128) not null,
    pwdIterations int not null,
    shirtTypeId int,
    shirtSizeId int,
    postId int,
    roleId int,
    
    constraint PK_Users primary key (id),
    constraint FK_Users_Persons foreign key (personId) references Persons(id),
    constraint UN_Users_username unique (username),
    constraint CH_Users_username check (CHAR_LENGTH(username) >= 3),
    constraint CH_Users_pwdHash check (CHAR_LENGTH(pwdHash) = 128),
    constraint CH_Users_pwdIterations check (pwdIterations > 0),
    constraint FK_Users_ShirtTypes foreign key (shirtTypeId) references ShirtTypes(id),
    constraint FK_Users_ShirtSizes foreign key (shirtSizeId) references ShirtSizes(id),
    constraint FK_Users_Posts foreign key (postId) references Posts(id),
    constraint FK_Users_Roles foreign key (roleId) references Roles(id)
);

create table if not exists Teams (
	id int auto_increment,
    name nvarchar(32) not null,
    city nvarchar(32) not null,
    
    constraint PK_Teams primary key (id),
    constraint UN_Teams_name unique (name)
);

create table if not exists Players (
	personId int,
    teamId int,
    rankId int not null,
    
    constraint PK_Players primary key (personId, teamId),
    constraint FK_Players_Persons foreign key (personId) references Persons(id),
    constraint FK_Players_Teams foreign key (teamId) references Teams(id),
    constraint CK_Players_rankId check (rankId >= 0 and rankId <= 2)
);

create table if not exists Sessions (
	id int auto_increment,
    created timestamp default NOW() not null,
    userId int,
    sessionId nvarchar(128) not null,
    active bit default 1 not null,
    
    constraint PK_Sessions primary key (id),
    constraint FK_Sessions_Users foreign key (userId) references Users(id),
    constraint UN_Sessions unique (userId, sessionId)
);
    
    