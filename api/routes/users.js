
import express from 'express'
const router = express.Router();
const PATH = "/users";

import controller from '../controllers/users.js'
import Auth from '../middlewares/auth.js'
import { accountVerify } from '../controllers/newUserVeri.js'
import { check } from 'express-validator';

router.post('/recaptcha-verification', controller.recaptchaVeri);
router.post('/signup', [check("email").normalizeEmail()], controller.signUp);
router.post('/account-verification', accountVerify);
router.get('/auth',Auth.checkAuth, controller.userAuth);
router.get('/all', Auth.checkAuth, Auth.isAdmin, controller.getUsers)
router.post('/login', [check("email").normalizeEmail()], controller.login);
router.post('/logout', Auth.checkAuth, controller.logout);
router.post('/change-password', Auth.checkAuth, controller.changePassword);
router.delete('/delete-user', Auth.checkAuth, controller.deleteUser, controller.logout);
router.patch('/edit-user-a', Auth.checkAuth, Auth.isAdmin, controller.editUserDetailsAdmin);
router.patch('/edit-user', Auth.checkAuth, controller.editUserDetails);
router.post('/add-user', Auth.checkAuth, [check("email").normalizeEmail()], Auth.isAdmin, controller.addUser);
router.delete('/delete-user-a/:userId', Auth.checkAuth, Auth.isAdmin, controller.deleteUserAdmin);
router.get('/:email', Auth.checkAuth, controller.getUserByEmail);

export default {
    PATH,
    router: router
}