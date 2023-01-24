const Pool = require("../config/db");
/*
id_user SERIAL PRIMARY KEY,
    name VARCHAR(50),
    email VARCHAR(100), 
    phonenumber BIGINT, 
    password VARCHAR(30), 
    photo VARCHAR(255));
*/

const create = ({ id, name, email, password }) => {
  return new Promise((resolve, reject) => {
    Pool.query(
      'INSERT INTO "users" (id, name, email, password)VALUES($1, $2, $3, $4 )',
      [id, name, email, password],
      (error, result) => {
        if (!error) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
  });
};
const findEmail = (email) => {
  return new Promise((resolve, reject) =>
    Pool.query(`SELECT * FROM users where email='${email}'`, (err, result) => {
      if (!err) {
        resolve(result);
      } else {
        reject(err);
      }
    })
  );
};
const verification = (email) =>
  new Promise((resolve, reject) =>
    Pool.query(
      `UPDATE users SET verif=1 WHERE "email"='${email}'`,
      (err, result) => {
        if (!err) {
          resolve(result);
        } else {
          reject(err);
        }
      }
    )
  );
const profileUser = (id) => {
  return Pool.query(`SELECT * FROM users WHERE id=$1 `, [id]);
};

const updateUserProfile = ({
  name,
  email,
  password,
  phone,
  image,
  updated_at,
  username,
  bio,
  id,
}) => {
  return new Promise((resolve, reject) => {
    Pool.query(
      `UPDATE "users" SET 
                  name = COALESCE($1, name), 
                  email = COALESCE($2, email),  
                  password = COALESCE($3, password),  
                  phone = COALESCE($4, phone),    
                  image = COALESCE($5, image),  
                  updated_at = COALESCE($6, updated_at),
                  username = COALESCE($7, username),
                  bio = COALESCE($8, bio)
                  WHERE id = $9;`,
      [name, email, password, phone, image, updated_at, username, bio, id],
      (err, result) => {
        if (!err) {
          console.log("result update user", result);
          resolve(result);
        } else {
          reject(new Error(err));
        }
      }
    );
  });
};

const getAll = () => {
  return new Promise((resolve, reject) =>
    Pool.query(`SELECT * FROM users`, (err, result) => {
      if (!err) {
        resolve(result);
      } else {
        reject(err);
      }
    })
  );
};

const searchUser = (email) => {
  return Pool.query(`SELECT * FROM users WHERE email = '${email}'`);
};

module.exports = {
  create,
  findEmail,
  verification,
  profileUser,
  updateUserProfile,
  searchUser,
  getAll,
};
