import express from 'express'
import verifyJWT from '../../Auth/middleware/verifyJWT.js';
import { savePreferences,getMyPreferences } from '../controller/preference.controller.js';

const PreferenceRoute = express.Router();


PreferenceRoute.post('/save-preferences',verifyJWT,savePreferences)
PreferenceRoute.get("/me",verifyJWT,getMyPreferences);

export default PreferenceRoute;