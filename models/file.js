const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const timestamp = require('mongoose-timestamp');
const mongoosePaginate = require('mongoose-paginate');


const FileSchema = new Schema({
    category : { type : Schema.Types.ObjectId , ref : 'Category'},
    title : { type : String},
    url : { type : Object},
    type : { type : String},
    size : { type : String},
    description : { type : String},
    deleted : { type : Boolean , default : false}
})

FileSchema.plugin(timestamp);
FileSchema.plugin(mongoosePaginate);



module.exports = mongoose.model('File', FileSchema);
