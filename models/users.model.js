const { db } = require("../config/db.js");
const { attachPaginate } = require("knex-paginate");
attachPaginate();

const _register = (lname, fname, email, password) => {
    return db("users")
        .insert({ lname, fname, email, password })
        .returning(["fname", "lname", "user_id", "email"]);
};

const _login = (email) => {
    return db("users").select("user_id", "email", "password", "admin").where({ email });
};

const _getPassword = ({ user_id }) => {
    return db("users").select("password").where({ user_id });
};

const _putPass = ({ user_id, hash }) => {
    return db("users")
        .update({ password: hash })
        .where({ user_id })
        .returning(["password"]);
};

const _getUserInfo = (userId) => {
    return db("users")
        .select("user_id", "email", "password", "fname", "lname")
        .where({ user_id: userId });
};

const _putUserInfo = ({ user_id, fname, lname, email }) => {
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
    return db("samples").where({ publicid }).del().returning();
};

const _putDescriptors = ({ descriptors, user_id }) => {
    return db("users")
        .update({ descriptors })
        .where({ user_id })
        .returning(["fname", "lname", "email", "descriptors"]);
};

const _getAllDescriptors = () => {
    return db("users").select("descriptors");
};

const _postDetection = (fieldsToInsert) => {
    return db("detections")
        .insert(fieldsToInsert)
        .returning(["user_id", "time"]);
};

const _getUserStatistics = ({ user_id, perPage, currentPage }) => {
    return db("detections as d")
        .join("users as u", "u.user_id", "d.user_id")
        .select("d.detection_id", "u.user_id", "u.fname", "u.lname", "d.time")
        .where({ "u.user_id": user_id })
        .orderBy("d.detection_id", "desc")
        .paginate({
            perPage,
            currentPage,
        });
};

const _getUserStatisticsTotal = ({ user_id }) => {
    return db("detections as d").count("detection_id").where({ user_id });
};

const _getAdminStatistics = ({ perPage, currentPage }) => {
    return db("detections as d")
        .join("users as u", "u.user_id", "d.user_id")
        .select("d.detection_id", "u.user_id", "u.fname", "u.lname", "d.time")
        .orderBy("d.detection_id", "desc")
        .paginate({
            perPage,
            currentPage,
        });
};

const _getAdminStatisticsTotal = () => {
    return db("detections as d").count("detection_id");
};
const _getAllUserNames = () => {
    return db("users").select("user_id", "fname");
};

const _getUserLabels = () => {
    return db("users").select("user_id", "fname", "lname");
};

const _getAdminByDayStatistics = ({ date }) => {
    const startOfTheDay = new Date(date.substring(0, 11) + "00:00:00.000Z");
    const endOfTheDay = new Date(date.substring(0, 11) + "23:59:59.999Z");

    return db("detections as d")
        .join("users as u", "u.user_id", "d.user_id")
        .select("d.detection_id", "u.user_id", "u.fname", "u.lname", "d.time")
        .orderBy("d.detection_id", "desc")
        .where("d.time", ">=", startOfTheDay)
        .where("d.time", "<=", endOfTheDay);
};

const _getAdminByDayStatisticsTotal = ({ date }) => {
    const startOfTheDay = new Date(date.substring(0, 11) + "00:00:00.000Z");
    const endOfTheDay = new Date(date.substring(0, 11) + "23:59:59.999Z");

    return db("detections as d")
        .where("d.time", ">=", startOfTheDay)
        .where("d.time", "<=", endOfTheDay)
        .countDistinct("user_id");
};

const _getAdminByUserStatistics = ({ user_id, start, end }) => {
    return db("detections as d")
        .join("users as u", "u.user_id", "d.user_id")
        .select("d.detection_id", "u.user_id", "u.fname", "u.lname", "d.time")
        .orderBy("d.detection_id", "desc")
        .where({ "u.user_id": user_id })
        .where("d.time", ">=", `${start}`)
        .where("d.time", "<=", `${end}`);
};

const _getStatisticsByDay = ({ date, user_id }) => {
    const startOfTheDay = new Date(date.substring(0, 11) + "00:00:00.000Z");
    const endOfTheDay = new Date(date.substring(0, 11) + "23:59:59.999Z");
    console.log("USER ID in models: ", user_id)
    return db("detections as d")
    .join("users as u", "u.user_id", "d.user_id")
        .select("d.detection_id", "u.user_id", "u.fname", "u.lname", "d.time")
        .orderBy("d.detection_id", "desc")
        .where("d.time", ">=", startOfTheDay)
        .where("d.time", "<=", endOfTheDay)
        .where({ "u.user_id": user_id });
};

const _getStatisticsTotalByDay = ({ date, user_id }) => {
    const startOfTheDay = new Date(date.substring(0, 11) + "00:00:00.000Z");
    const endOfTheDay = new Date(date.substring(0, 11) + "23:59:59.999Z");
    console.log("USER ID in models: ", user_id)

    return db("detections as d")
        .where({ "user_id": user_id })
        .where("d.time", ">=", startOfTheDay)
        .where("d.time", "<=", endOfTheDay)
        .countDistinct("user_id");
};

const _getStatisticsByUser = ({ user_id, start, end }) => {
    return db("detections as d")
        .join("users as u", "u.user_id", "d.user_id")
        .select("d.detection_id", "u.user_id", "u.fname", "u.lname", "d.time")
        .orderBy("d.detection_id", "desc")
        .where({ "u.user_id": user_id })
        .where("d.time", ">=", `${start}`)
        .where("d.time", "<=", `${end}`);
};
const _getStatisticsByUserAsc = ({ user_id, start, end }) => {
    return db("detections as d")
        .join("users as u", "u.user_id", "d.user_id")
        .select("d.detection_id", "u.user_id", "u.fname", "u.lname", "d.time")
        .orderBy("d.detection_id", "asc")
        .where({ "u.user_id": user_id })
        .where("d.time", ">=", `${start}`)
        .where("d.time", "<=", `${end}`);
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
    _putDescriptors,
    _getAllDescriptors,
    _postDetection,
    _getUserStatistics,
    _getUserStatisticsTotal,
    _getAdminStatistics,
    _getAdminStatisticsTotal,
    _getAllUserNames,
    _getPassword,
    _putPass,
    _getAdminByDayStatistics,
    _getAdminByDayStatisticsTotal,
    _getUserLabels,
    _getAdminByUserStatistics,
    _getStatisticsByDay,
    _getStatisticsTotalByDay,
    _getStatisticsByUser,
    _getStatisticsByUserAsc,
};
