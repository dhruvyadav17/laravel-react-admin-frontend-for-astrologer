// PATH: src/store/api/index.ts
// FIX: astrologer.api export add kiya
//      user.api se getAstrologers/getAstrologer hooks hataye — conflict tha

export { baseApi } from "./baseApi";

export * from "./admin.api";
export * from "./astrologer.api";  // ADD — yahan se useGetAstrologersQuery aayega
// user.api se * export nahi karte — conflict avoid karne ke liye
export { useGetTodayPanchangQuery } from "./user.api";  // sirf panchang hook