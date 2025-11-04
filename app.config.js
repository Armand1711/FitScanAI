const dotenv = require('dotenv');
dotenv.config();

module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    },
  };
};