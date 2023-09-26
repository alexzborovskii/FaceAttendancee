// const logger = (req, res, next) => {
//     console.log('url => ', req.url);
//     console.log('method => ', req.method);
//     console.log('params => ', req.params);
//     console.log('query => ', req.query);
//     console.log('body => ', req.body);
//     next();
//   }

//   const auth = (req, res) => {
//     const user = req.query.user;
//     if (user == 'admin') {
//       next()
//     } else {
//       res.status(401).send("Unauthorize")
//     }
//   }

//   module.exports = {logger, auth};