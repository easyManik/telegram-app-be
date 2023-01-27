const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { generateToken, generateRefreshToken } = require("../helper/auth");
const { responses } = require("../middleware/common");
const { findEmail, create, verification } = require("../model/user");
const email = require("../middleware/email");
const ModelUsers = require("../model/user");
const jwt = require("jsonwebtoken");

const Port = process.env.PORT;
const Host = process.env.HOST;

const UserController = {
  register: async (req, res, next) => {
    const {
      rows: [users],
    } = await findEmail(req.body.email);
    if (users) {
      return responses(res, 404, false, "Email already use", "register fail");
    }
    const digit = "012456789";
    let otp = "";
    for (let i = 0; i < 6; i++) {
      otp += digit[Math.floor(Math.random() * 10)];
    }
    const password = bcrypt.hashSync(req.body.password);
    const data = {
      id: uuidv4(),
      name: req.body.name,
      email: req.body.email,
      password,
      otp,
    };
    try {
      const result = await create(data);
      if (result) {
        const verifyUrl = `http://${Host}:${Port}/users/${req.body.email}/${otp}`;
        const sendEmail = email(data.email, otp, verifyUrl, data.name);
        if (sendEmail == "email not send") {
          return responses(res, 404, false, null, "register fail");
        }
        responses(
          res,
          200,
          true,
          { email: data.email },
          "Register success. Check your email to validation account!"
        );
      }
    } catch (e) {
      console.log(e);
      responses(res, 404, false, e, "Register fail usercontroller!");
    }
  },
  login: async (req, res, next) => {
    console.log("Email", req.body.email);
    console.log("Password", req.body.password);
    const {
      rows: [user],
    } = await findEmail(req.body.email);
    if (!user) {
      return responses(res, 404, false, null, "Email bot found");
    }
    if (user.verif == 0) {
      return responses(res, 404, false, null, "Email not verify");
    }

    const password = req.body.password;
    const validate = bcrypt.compareSync(password, user.password);
    if (!validate) {
      return responses(res, 404, false, null, "Wrong password");
    }
    delete user.password;
    delete user.otp;
    delete user.verif;
    const payload = {
      id: user.id,
      email: user.email,
    };
    console.log("login payload", payload);
    user.token = generateToken(payload);
    user.refreshToken = generateRefreshToken(payload);
    responses(res, 200, false, user, "Login success");
  },
  otp: async (req, res, next) => {
    console.log("Email", req.body.email);
    console.log("Password", req.body.otp);
    const {
      rows: [user],
    } = await findEmail(req.body.email);
    if (!user) {
      return responses(res, 404, false, null, "Email not found");
    }
    if (user.otp == req.body.otp) {
      const result = await verification(req.body.email);
      return responses(res, 200, true, result, "Verification email success");
    }
    return responses(
      res,
      404,
      fail,
      null,
      "Otp not valid, please check your email!"
    );
  },
  profile: async (req, res) => {
    try {
      const { id } = req.payload;
      console.log(id);
      const {
        rows: [data],
      } = await ModelUsers.profileUser(id);

      return responses(res, 200, true, data, "get data success");
    } catch (e) {
      console.log(e);
    }
  },

  getAll: async (req, res) => {
    try {
      const result = await ModelUsers.getAll();
      if (result) {
        // console.log("get all user", result);
        responses(res, 200, true, result.rows, "get all data success");
      }
    } catch (e) {
      console.log(e);
    }
  },

  updateUserProfile: async (req, res, next) => {
    try {
      console.log(req.files);
      let token = req.headers.authorization.split(" ")[1];
      let payload = jwt.verify(token, process.env.JWT_KEY);
      const id = payload.id;
      const { name, email, phone, username, bio } = req.body;
      const image = req.files.image[0].path;
      let profile = {};
      profile.image = image ? image[0].path : null;

      const data = {
        id,
        name,
        email,
        phone,
        username,
        image,
        bio,
      };
      console.log("data update user profile", data);
      await ModelUsers.updateUserProfile(data);
      responses(res, 200, true, data, "update data success");
    } catch (error) {
      console.log(error);
      // next(errorServ);
    }
  },
  // refreshToken: (req, res) => {
  //   const refreshToken = req.body.refreshToken;
  //   const decode = jwt.verify(refreshToken, process.env.SECRET_KEY_JWT);
  //   const payload = {
  //     id: decode.id,
  //     email: decode.id,
  //   };
  //   const result ={
  //     token : generateToken(payload)
  //     refreshToken : generateRefreshToken(payload)
  //   }
  //   responses(res, 200, true, result.rows, "refresh token berhasil");
  // },
};
exports.UserController = UserController;
