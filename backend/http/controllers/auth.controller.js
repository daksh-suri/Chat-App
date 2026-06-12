import { signin, signup } from "../services/auth.service.js";
import { signinSchema, signupSchema } from "../schemas/auth.schemas.js";

export async function postSignup(req, res, next) {
    try {
        const result = signupSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: 'Invalid signup payload',
                error: result.error.flatten()
            });
        }

        const { email, name, password } = req.body;
        const data = await signup({ email, name, password });

        return res.status(200).json({ data });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || 'Error While Signup',
            error: error.message || error
        });
    }
}

export async function postSignin(req, res, next) {
    try {
        const result = signinSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: 'Invalid signin payload',
                error: result.error.flatten()
            });
        }

        const { email, password } = req.body;
        const data = await signin({ email, password });

        return res.status(200).json({ data });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || 'Error While Signin',
            error: error.message || error
        });
    }
}

export async function getMe(req, res, next) {
    return res.status(200).json({
        user: req.user
    })
}