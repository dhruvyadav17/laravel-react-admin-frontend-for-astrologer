// PATH: src/store/api/index.ts
// ADD: consultation.api export

export { baseApi }                  from "./baseApi";
export * from "./admin.api";
// export * from "./auth.api";
export * from "./astrologer.api";
export * from "./consultation.api"; // NEW
export { useGetTodayPanchangQuery } from "./user.api";