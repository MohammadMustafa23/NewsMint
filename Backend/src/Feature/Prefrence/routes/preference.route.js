import express from 'express'
import verifyJWT from '../../Auth/middleware/verifyJWT.js';
import { savePreferences,getMyPreferences,checkMyPreferences,updatePreferences } from '../controller/preference.controller.js';
import { savePreferencesLimiter, readPreferencesLimiter, updatePreferencesLimiter } from '../middleware/rateLimit/preferenceRateLimiter.js';
const PreferenceRoute = express.Router();


PreferenceRoute.post('/save-preferences', savePreferencesLimiter, verifyJWT, savePreferences);
PreferenceRoute.get("/me", readPreferencesLimiter, verifyJWT, checkMyPreferences);
PreferenceRoute.get("/dashboard", verifyJWT, getMyPreferences);
PreferenceRoute.put("/update-preferences", updatePreferencesLimiter, verifyJWT, updatePreferences);


export default PreferenceRoute;