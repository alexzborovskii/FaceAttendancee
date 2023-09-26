const { db } = require("../config/db.js");

const _register = (email, password) => {
    return db("users")
        .insert({ email, password })
        .returning(["user_id", "email"]);
};

const _login = (email) => {
    return db("users").select("user_id", "email", "password").where({ email });
};

const _getUserInfo = (userId) => {
    return db("users")
        .select("user_id", "email", "password", "fname", "lname")
        .where({ user_id: userId });
};

const _putUserInfo = ({user_id, fname, lname, email}) => {
    return db("users")
        .update({ fname, lname, email })
        .where({ user_id })
        .returning(["fname", "lname", "email"]);
};

const _insertSample = ({ user_id, publicid }) => {
    return db("samples").insert({ user_id: user_id, publicid: publicid }, [
        "sample_id",
        "user_id",
        "publicid",
    ]);
};

const _getUserSamples = ({ user_id }) => {
    return db("samples").select("publicid").where({ user_id });
};

const _getSamplesAndUser = ({ user_id }) => {
    return db("samples as s")
        .join("users as u", "u.user_id", "s.user_id")
        .select("s.publicid", "u.user_id", "u.email", "u.fname", "u.lname")
        .where({ "u.user_id": user_id });
};

const _delUserSample = ({ publicid }) => {
    console.log("publicid in models: ", publicid);
    return db("samples").where({ publicid }).del().returning();
};

module.exports = {
    _register,
    _login,
    _getUserInfo,
    _insertSample,
    _getUserSamples,
    _delUserSample,
    _getSamplesAndUser,
    _putUserInfo,
};
