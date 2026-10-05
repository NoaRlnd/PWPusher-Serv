import { User } from "../models/user.model.js";

const authStatus = async (req, res) => {
    try {
        
    } catch (error) {
        res.status(500).json({
            message: "internal serv error", error
        });
    }
};

const setupMFA = async (req, res) => {
    try {
        
    } catch (error) {
        res.status(500).json({
            message: "internal serv error", error
        });
    }

};

const verifyMFA = async (req, res) => {
    try {
        
    } catch (error) {
        res.status(500).json({
        message: "internal serv error", error
        });
    }

};

const resetMFA = async (req, res) => {
    try {
        
    } catch (error) {
        res.status(500).json({
            message: "internal serv error", error
        });
    }

}

export {
    authStatus,
    setupMFA,
    verifyMFA,
    resetMFA
};