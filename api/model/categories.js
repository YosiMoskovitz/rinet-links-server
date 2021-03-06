
import mongoose from 'mongoose';

const categorySchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true }
});

categorySchema.set('toJSON', {
    virtuals: true, // convert _id to id
    versionKey: false,
        transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
    }
});

categorySchema.method('toClient', function() {
    var obj = this.toObject();
    //Rename fields
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v

    let objectOrder = {
        'id': null,
    }

    obj = Object.assign(objectOrder, obj);

    return obj;
});

export default mongoose.model('Category', categorySchema)