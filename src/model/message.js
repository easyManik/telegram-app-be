const pool = require("../config/db");

const create = ({ id, body, sender_id, receiver_id }) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "INSERT INTO chat (id, body, sender_id, receiver_id) values ($1, $2, $3, $4)",
      [id, body, sender_id, receiver_id],
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
const getMessage = ({ sender_id, receiver_id }) => {
  console.log("sender id: ", sender_id);
  console.log("receiver id : ", receiver_id);
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT * FROM chat where (sender_id = '${sender_id}' AND receiver_id = '${receiver_id}') OR (sender_id = '${receiver_id}' AND receiver_id = '${sender_id}') ORDER BY post_at ASC`,
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
const deleteMessage = (id) => {
  return pool.query("DELETE FROM chat WHERE id = $1", [id]);
};

module.exports = {
  create,
  getMessage,
  deleteMessage,
};
