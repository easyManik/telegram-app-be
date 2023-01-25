-- Active: 1671418277284@@localhost@5432@telegramapp
create table users(
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(50) not NULL,
    email VARCHAR(100) NOT NULL, 
    password VARCHAR(255) NOT NULL, 
    image VARCHAR(500) DEFAULT NULL,
    updated_at TIMESTAMP,
    username VARCHAR(255),
    bio VARCHAR(300)
    );

ALTER TABLE users ADD phone BIGINT;

ALTER TABLE users 
ADD CONSTRAINT users_id_pk
PRIMARY KEY (id);

CREATE TABLE chat(
    id SERIAL PRIMARY KEY NOT NULL,
    message VARCHAR(255)  ,
    sender_id varchar(255) not NULL,
    receiver_id varchar(255) not null ,
    post_at timestamp default current_timestamp,
    UNIQUE (id)
);

drop TABLE users;

CREATE TABLE groupmessage (
    id varchar(255) not null,
    body VARCHAR(255) NOT NULL,
    sender_id varchar(255) not null REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    room_id varchar(255) not null,
    post_at timestamp default current_timestamp,
    UNIQUE (id)
);

INSERT INTO chat (id, body, receiver_id, sender_id ) values ('1sdcefdcxzsw23464', 'hy', '9c01c605-3b43-49ef-b5fd-6a3c6bbca852', 'a27713ea-d3f2-4d57-ad18-76c6a8f55fcd');