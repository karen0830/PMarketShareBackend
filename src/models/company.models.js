import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    legalEntity: {
        type: String,
        required: true,
        trim: true
    },
    companyAddress: {
        type: String,
        required: true,
        trim: true
    },
    activityDescription: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: Number,  
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    taxIdentity: {
        type: Number, 
        required: true,
        trim: true
    }, 
    password: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

export default mongoose.model('CompanyModel', companySchema);
