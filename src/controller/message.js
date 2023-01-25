const { create, getMessage, deleteMessage } = require("../model/message");
const { v4: uuid } = require("uuid");
const response = require("../helper/response");

module.exports.getMessage = async (req, res, next) => {
  const receiver_id = req.params.receiver_id;
  const sender_id = req.payload.id;
  const { rows } = await getMessage(sender_id, receiver_id);
  response(res, rows, 200, "success add message");
};

module.exports.create = async (req, res, next) => {
  try {
    const payload = req.payload;
    const { id, type } = payload;
    console.log(id);
    // if (type != "access-token") {
    //   return response(res, [], 404, "TOKEN WRONG");
    // }
    const { message, receiver_id, id: uuid } = req.body;
    const data = {};
    data.id = uuid;
    data.message = message;
    data.sender_id = id;
    data.receiver_id = receiver_id;
    const { rowCount } = await create(data);
    if (!rowCount) {
      return response(res, [], 404, "failed add message");
    }
    response(res, data, 200, "success add message");
  } catch (error) {
    console.log(error);
  }
};

module.exports.deleteMessage = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { rowCount } = await deleteMessage(id);
    if (!rowCount) {
      return response(res, [], 200, "delete failed");
    }
    return response(res, [], 200, "delete success");
  } catch (error) {
    console.log(error);
  }
};
