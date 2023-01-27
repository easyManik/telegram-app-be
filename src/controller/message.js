const { create, getMessage, deleteMessage } = require("../model/message");
const { v4: uuid } = require("uuid");
const { responses } = require("../middleware/common");

module.exports.getMessage = async (req, res, next) => {
  const receiver_id = req.params.receiver_id;
  const sender_id = req.payload.id;
  const { rows } = await getMessage(sender_id, receiver_id);
  responses(res, 200, true, rows, "success add message");
};

module.exports.create = async (req, res, next) => {
  try {
    const payload = req.payload;
    const { id, type } = payload;
    console.log(id);
    const { message, receiver_id, id: uuid } = req.body;
    const data = {};
    data.id = uuid;
    data.message = message;
    data.sender_id = id;
    data.receiver_id = receiver_id;
    const { rowCount } = await create(data);
    if (!rowCount) {
      return responses(res, 404, false, [], "add message fail");
    }
    responses(res, 200, true, data, "success add message");
  } catch (error) {
    console.log(error);
  }
};

module.exports.deleteMessage = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { rowCount } = await deleteMessage(id);
    if (!rowCount) {
      responses(res, 404, false, [], "delete failed");
    }
    return responses(res, 200, true, [], "delete success");
  } catch (error) {
    console.log(error);
  }
};
