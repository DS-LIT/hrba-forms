import { PublicClientApplication } from "@azure/msal-browser";
import { loginRequest } from "../authConfig";

/**
 * Handles user sign-in and sets the active account.
 * @param instance - The MSAL PublicClientApplication instance.
 * @returns The signed-in account object.
 * @throws Error if the sign-in fails.
 */
export const signInUser = async (instance: PublicClientApplication) => {
    try {
        // Initiate the login process
        const loginResponse = await instance.loginPopup(loginRequest);

        // Set the active account after login
        instance.setActiveAccount(loginResponse.account);

        console.log("Login successful:", loginResponse.account);
        return loginResponse.account;
    } catch (error) {
        console.error("Error during login:", error);
        throw new Error("Sign-in failed. Please try again.");
    }
};