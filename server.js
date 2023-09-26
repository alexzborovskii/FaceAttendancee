const express = require("express");
const cors = require("cors");
const path = require('path');
const {cloudinary} = require('./utils/cloudinary.js');

//
const cookieParser = require("cookie-parser")
require("dotenv").config();
//
const app = express();
app.use(express.static('public'));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '50mb',extended: true }));
app.use(express.json());

//
// const { p_router } = require("./routes/products.router.js");
const { u_router } = require("./routes/users.router.js");


app.use(cors());
app.use(cookieParser());


app.listen(process.env.PORT || 3005, () => {
  console.log(`run on port ${process.env.PORT || 3005}`);
});
//3005

// app.use("/api/products", p_router);
app.use("/api/users", u_router);


app.get('/api/images', async (req, res) => {
    const { resources } = await cloudinary.search
        .expression('folder:dev_setups')
        .sort_by('public_id', 'desc')
        .max_results(30)
        .execute();

    const publicIds = resources.map((file) => file.public_id);
    res.send(publicIds);
});






// // Have Node serve the files for our built React app
// // app.use(express.static(path.resolve(__dirname, "./client/build")));
// app.use(express.static(path.join(__dirname, "/client/build")));

// // All other GET requests not handled before will return our React app
// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
// });
