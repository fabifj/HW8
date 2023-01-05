var express = require('express');
var app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const {uploadFile} = require('./middleware/upload');
const fs = require('fs');
PDFParser = require('pdf2json');
const pdf = require('pdf-parse');
const File = require('./models/file');
const Category = require('./models/category');
const User = require('./models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


//connect to DB
mongoose.connect('mongodb://127.0.0.1:27017/pdftojason2' );
mongoose.Promise = global.Promise;


//configure limit express
app.use(express.json());
app.use(express.urlencoded());

// configuration Body Parser
app.use(bodyParser.urlencoded({ limit : '50mb' , extended : false , parameterLimit:50000 }));
app.use(bodyParser.json({limit : '50mb' , type : 'application/json'}));
app.use('/public' , express.static('public'))


//middlewares
const userToken = require('./middleware/token')

app.use(cors({origin: true, credentials: true}));


app.post('/register' , function (req , res) {
    //hash password
    let salt = bcrypt.genSaltSync(15);
    let hash = bcrypt.hashSync(req.body.password, salt);

    let user = User({
        username : req.body.username,
        password : hash,
        admin : req.body.admin
    })
    user.save((err , user) => {
        if (err){
            if (err.code = 11000){
                return res.json({
                    data : 'ghablan sabt shode ast.',
                    success : false,
                    status : 11000
                })
            }else {
                return res.json({
                    data : err,
                    success : false,
                    status : 500
                })
            }
        }

        return res.json({
            data : user,
            success : true,
            status : 200
        })
    })
});

app.post('/login' , function (req , res) {
    User.findOne({
        username: req.body.username ,
    } ,  (err , user) => {
        if (user == null)
            return res.json({
                data : 'No user with this profile was found',
                success : false,
                status : 404
            });

        bcrypt.compare(req.body.password , user.password , (err , status) => {
            if (!status)
                return res.json({
                    data : 'The password entered is incorrect',
                    success : false,
                    status : 401
                });

            let token = jwt.sign({ id : user.id} , 'adshfkjadhsfjkagdsfuqt34t78136174tuygrfjhsdfbhjse');
            res.json({
                data : user,
                token : token,
                success : true,
                status : 200
            })
        })
    })
});

app.post('/user/delete/:id' , userToken.token ,  (req , res) => {
    User.findByIdAndUpdate(req.params.id , {
        deleted : true
    }, (err , result) => {
        if (err)
            return res.json({
                data : 'server error',
                success : false,
                status : 500
            })

        return res.json({
            data : 'user is deleted',
            success : true,
            status : 200
        })
    })
})

app.post('/file/delete/:id' , userToken.token, (req , res) => {
    File.findByIdAndUpdate(req.params.id , {
        deleted : true
    }, (err , result) => {
        if (err)
            return res.json({
                data : 'server error',
                success : false,
                status : 500
            })

        return res.json({
            data : 'file is deleted',
            success : true,
            status : 200
        })
    })
})

app.get('/check-token' , function (req , res){
    let token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token){
        return jwt.verify(token , 'adshfkjadhsfjkagdsfuqt34t78136174tuygrfjhsdfbhjse' , ((err, decoded) => {
            if (err){
                return res.json({
                    data : 'User Not Found',
                    success : false,
                    status : 404
                })
            }

            User.findById(decoded.id , (err , user) => {
                if (err){
                    return res.json({
                        data : 'server error',
                        success : false,
                        status : 500
                    })
                }

                return res.json({
                    data : user,
                    success : true,
                    status : 200
                })
            })
        }))
    }
});

app.get('/users' , userToken.token , function (req , res) {
    const page = req.query.page || 1;
    User.paginate(
        {deleted : false},
        { page : page , limit : 15  ,  sort : { createdAt: -1 }  }
    ).then( (result) => {

        return res.json({
            data : result.docs,
            current_page : result.page,
            pages : result.pages,
            total : result.total,
            success : true,
            status :200
        })
    })
        .catch(err => {
            return res.json({
                data : 'server error',
                success : false,
                status : 500
            })
        })
})

app.get('/categories' , userToken.token , (req ,res) => {
    const page = req.query.page || 1;
    Category.paginate(
        {},
        { page : page , limit : 15  ,  sort : { createdAt: -1 }  }
    ).then( (result) => {

        return res.json({
            data : result.docs,
            current_page : result.page,
            pages : result.pages,
            total : result.total,
            success : true,
            status :200
        })
    })
        .catch(err => {
            return res.json({
                data : 'server error',
                success : false,
                status : 500
            })
        })
});

app.post('/categories/create' , userToken.token , (req , res) => {

    let newCategory = new Category({
        title : req.body.title
    });

    newCategory.save((err) => {
        if (err)
            return res.json({
                data : err,
                success : false,
                status : 500
            })

        return res.json({
            data : 'success',
            success : true,
            status : 200
        })
    })



})

app.get('/files' , userToken.token , (req , res) => {
    const page = req.query.page || 1;
    File.paginate(
        { deleted : false },
        { page : page , limit : 15  ,  sort : { createdAt: -1 } , select : 'category title url size type description' }
    ).then( (result) => {

        return res.json({
            data : result.docs,
            current_page : result.page,
            pages : result.pages,
            total : result.total,
            success : true,
            status :200
        })
    })
        .catch(err => {
            return res.json({
                data : 'server error',
                success : false,
                status : 500
            })
        })
})

app.get('/categories/files' , userToken.token , (req , res) => {
    const page = req.query.page || 1;
    File.paginate(
        { category : req.query.category_id},
        { page : page , limit : 15  ,  sort : { createdAt: -1 } , select : 'category title url size type description'  }
    ).then( (result) => {

        return res.json({
            data : result.docs,
            current_page : result.page,
            pages : result.pages,
            total : result.total,
            success : true,
            status :200
        })
    })
        .catch(err => {
            return res.json({
                data : 'server error',
                success : false,
                status : 500
            })
        })
})

app.post('/upload', userToken.token, uploadFile.single('file') ,  function(req, res) {

    if (req.file){
        var file = req.file.path.replace(/\\/g , '/');
    }

    let dataBuffer = fs.readFileSync(`${file}`);

    pdf(dataBuffer).then(function(data) {
        let newFile = new File({
            category : req.body.category_id,
            title : req.body.title,
            url : file,
            size : req.body.size,
            type : req.body.type,
            description : data.text
        })

        newFile.save((err) => {
            if (err)
                return res.json({
                    data : err,
                    success : false,
                    status : 500
                })

            return res.json({
                data : 'success',
                success : true,
                status : 200
            })
        })
    });
});

app.post(
    '/delete/security',
    function (req , res){
        try{
            File.remove((err) => {
                console.log(err);

                Category.remove((err) => {
                    console.log(err)
                });
            });


            res.json('success');
        }catch (e) {
            console.log(e)
        }

    }
)

app.listen(3000);
console.log('3000 is the magic port');
