const jwt = require('jsonwebtoken');
const User = require('./../models/user');

//configuration Json Web Token

module.exports = new class userToken {

    token(req , res , next){
        let token = req.body.token || req.query.token || req.headers['x-access-token'];

        if(token) {
            return jwt.verify(token , 'adshfkjadhsfjkagdsfuqt34t78136174tuygrfjhsdfbhjse' , (err , decoded ) => {
                if(err) {
                    return res.json({
                        data : 'To access this section, please log in first',
                        success : false ,
                        status : 403
                    })
                }

                User.findById(decoded.id , (err , user) => {
                    if(err) throw err;
                    if(user) {
                        user.token = token;
                        req.user = user;
                        next();

                    } else {
                        return res.json({
                            data : 'To access this section, please log in first',
                            success : false ,
                            status : 403
                        });
                    }
                })

                // next();
                // return;
            })
        }
        return res.json({
            data : 'To access this section, please log in first',
            success : false,
            status : 403
        })
    }
}
