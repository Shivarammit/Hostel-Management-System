// src/config.js

// Change this value based on where you're running
const ENV = "LOCAL"; // or "LOCAL"

const LOCAL_API = "http://localhost:8000";
const PROD_API = "http://13.126.94.138:8000";
export const BASE_API = ENV === "PROD" ? PROD_API : LOCAL_API;
