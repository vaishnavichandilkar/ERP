import api from "./api";

// Step 1: Mobile Registration (Send OTP)
export const registerMobile = async (phone) => {
    return await api.post("/onboarding/step1-mobile", {
        phone,
    });
};