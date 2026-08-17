import express from 'express'
import verifyJWT from '../../Auth/middleware/verifyJWT.js';
import { savePreferences,getMyPreferences,checkMyPreferences } from '../controller/preference.controller.js';

const PreferenceRoute = express.Router();


PreferenceRoute.post('/save-preferences',verifyJWT,savePreferences)
PreferenceRoute.get("/me",verifyJWT,checkMyPreferences);
PreferenceRoute.get("/dashboard",verifyJWT,getMyPreferences);

export default PreferenceRoute;