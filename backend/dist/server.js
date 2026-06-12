"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const supabase_1 = require("./config/supabase");
const PORT = env_1.env.PORT || 5001;
async function startServer() {
    try {
        // Automatically check and initialize Supabase storage buckets
        await (0, supabase_1.initializeStorageBuckets)();
        app_1.default.listen(PORT, () => {
            console.log(`🚀 Med India Backend listening on port ${PORT} in ${env_1.env.NODE_ENV} mode.`);
        });
    }
    catch (error) {
        console.error('💥 Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
