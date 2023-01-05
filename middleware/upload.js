const multer  = require('multer');
const mkdirp  = require('mkdirp');
const fs = require('fs')


const getDirFile = () => {
    let year = new Date().getFullYear();
    let month = new Date().getMonth() + 1;
    let day = new Date().getDay();
    let token = Math.floor(100000 + Math.random() * 900000);

    return  `./public/uploads/files/${year}/${month}/${day}/${token}`;
}

const FileStorage = multer.diskStorage({
    destination : (req , file , cb) => {

        let dir  = getDirFile();
        mkdirp(dir , err => cb(err , dir));

    },
    filename: (req , file , cb) => {
        let filePath = getDirFile() + '/' + file.originalname;
        if (!fs.existsSync(filePath))
            cb(null , file.originalname);
        else
            cb(null ,  Date.now() + '-' + file.originalname)

    }
});
const uploadFile = multer({
    storage : FileStorage,
});



module.exports = {
    uploadFile,
};
