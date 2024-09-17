exports.requestLogger = (req, res, next) => {
    console.log(req.body);
    console.log(req.headers)
    next()
}