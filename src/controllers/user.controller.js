import { User } from "../models/user.model.js";

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "les champs doivent être remplis"});
        }

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(400).json({ message: "user existe déjà" });
        }

        const user = await User.create({
            username,
            email: email.toLowerCase(),
            password,
            loggedIn: false,
        });

        res.status(201).json({
            message: "user enregistré",
            user: { id: user._id, email: user.email, username: user.username}
        });

    } catch (error) {
        res.status(500).json({ message: "internal serv error", error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        
        const { email, password } = req.body;

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if(!user) return res.status(404).json({
            message: "user pas trouvé"
        });

        const isMatch = await user.comparePassword(password);
        if(!isMatch) return res.status(400).json({
            message: "crédentiels invalides"
        });

        res.status(200).json({
            message: "user connecté",
            user: {
                id: user._id,
                email: user.email,
                username: user.username
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "internal serv error", error
        });
    }
};

const logoutUser = async (req, res) => {
    try {
        
        const { email } = req.body;

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) return res.status(404).json({
            message: "user pas trouvé"
        });

        res.status(200).json({
            message: "user déconnecté",
            user: {
                id: user._id,
                email: user.email,
                username: user.username
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "internal serv error", error
        });
    }
}

export {
    registerUser,
    loginUser,
    logoutUser
};