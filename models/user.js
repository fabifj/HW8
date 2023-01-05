const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const timestamp = require('mongoose-timestamp');
const mongoosePaginate = require('mongoose-paginate');
const bcrypt = require('bcrypt');


const UserSchema = new Schema({
    username : { type : String, required  : true , index : { unique : true}},
    password : { type : String, required : true},
    admin : { type : Boolean , default : false},
    deleted : { type : Boolean , default : false}
})

UserSchema.plugin(timestamp);
UserSchema.plugin(mongoosePaginate);

UserSchema.methods.comparePassword = function(password){
    return bcrypt.compareSync(password , this.password);
};




module.exports = mongoose.model('User', UserSchema);
