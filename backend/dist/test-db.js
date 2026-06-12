"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const https_1 = __importDefault(require("https"));
async function test() {
    console.log('Fetching Supabase schema...');
    const url = `${env_1.env.SUPABASE_URL}/rest/v1/`;
    const options = {
        headers: {
            'apikey': env_1.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${env_1.env.SUPABASE_ANON_KEY}`
        }
    };
    https_1.default.get(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                const paths = Object.keys(parsed.paths || {});
                const tables = paths.filter(p => !p.includes('/rpc/'));
                const rpcs = paths.filter(p => p.includes('/rpc/'));
                console.log('Tables found in database:', tables);
                console.log('RPC functions found in database:', rpcs);
            }
            catch (err) {
                console.error('Failed to parse response:', err.message);
                console.log('Raw response:', data.substring(0, 500));
            }
        });
    }).on('error', (err) => {
        console.error('Request failed:', err.message);
    });
}
test();
