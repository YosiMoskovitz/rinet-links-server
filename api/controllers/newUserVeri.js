
import { User } from "../model/user.js"
import Status from "../model/statuses.js"
import Token from '../model/resetToken.js'
import { sendTokenMail, sendInfoMail } from '../mail/sendEmail.js'

var invalidError = {
    code: 400,
    message: "invalid_link_or_expired"
}

export const sendVerificationEmail = async (user) => {
    try {
        const result = await sendTokenMail(
            '../mail/htmlTemplates/newUserVer.html',
            'account-verification',
            "אימות חשבון",
            user
        );

        if (result === 200) return 'OK'
        else throw result

    } catch (error) {
        if (!error.code) error.code = 500
        if (!error.message) error.message = 'SERVER_ERROR'
        return error
    }
};

export const accountVerify = async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        if (!user) throw invalidError;

        const token = await Token.findOne({
            userId: user._id,
            token: req.body.token,
        });
        if (!token) throw invalidError;

        let status = await Status.findOne({title: 'active'})
        user.status = status._id
        user.isEmailVerified = true;
        await user.save();
        await token.delete();

        const text = 'חשבונך הופעל בהצלחה.'

        const result = await sendInfoMail(
            '../mail/htmlTemplates/welcome.html',
            "חשבונך הופעל",
            user,
            text
        );
        
        const emailError =  result !== 'OK' ? result : null

        res.status(200).json({
            message: 'Account_Verified',
            emailError
        });

    } catch (error) {
        if (!error.code) error.code = 500
        if (!error.message) error.message = 'SERVER_ERROR'
        res.status(error.code).json(error.message)
    }
};