const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const timestamp = require('mongoose-timestamp');
const mongoosePaginate = require('mongoose-paginate');


const CategorySchema = new Schema({
    title : { type : String},
})

CategorySchema.plugin(timestamp);
CategorySchema.plugin(mongoosePaginate);



module.exports = mongoose.model('Category', CategorySchema);
