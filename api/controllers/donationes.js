import Donation from "../model/donationes.js"
import {User} from "../model/user.js"

var errorObj = {
    code: 500,
    message: "SERVER_ERROR"
}

export default {
    addDonation: async (req, res) => {
        //only allow req from nedarim plus website
        if (req.headers['x-forwarded-for'] !== '18.194.219.73') throw errorObj
        
        const user = await User.findById(req.params.userId);
        if (!user) {
            errorObj.code = 404;
            errorObj.message = "USER_NOT_FOUND";
            throw errorObj;
        }
        try {
            const {
                TransactionTime,
                Amount,
                Currency,
                Tashloumim,
                LastNum,
                Confirmation,
                Comments} = req.body;
    
            const newDonation = new Donation({
                user: user._id,
                TransactionTime,
                Amount,
                Currency,
                Tashloumim,
                LastNum,
                Confirmation,
                Comments,
                incomingJson: req.body
            })
            await newDonation.save();
    
            res.status(200).json({
                message: 'New_Donation_Recorded'
            });
        } catch (error) {
            console.log(error.message)
            if (!error.code) {
                error.code = 500
            }
            res.status(error.code).json(error.message)
        }       
    },
    getUserDonations: (req, res) => {
        Donation.find({ user: req.params.userId }).then((donations)=> {
            if (donations.length > 0) {
                res.status(200).json({
                    donations
                })
            }
            else {
                errorObj.code = 404;
                errorObj.message = "NO_DONATIONS_FOUND";
                throw errorObj;
            }
        }).catch(error =>{
            if (!error.code) {
                error.code = 500
            }
            res.status(error.code).json(error.message)
        }) 
    },
    getAllDonations: (req, res) => {
        Donation.find().then((donations)=> {
            if (donations.length > 0) {
                res.status(200).json({
                    donations
                })
            }
            else {
                errorObj.code = 404;
                errorObj.message = "NO_DONATIONS_FOUND";
                throw errorObj;
            }
        }).catch(error =>{
            if (!error.code) {
                error.code = 500
            }
            res.status(error.code).json(error.message)
        }) 
    }
}
