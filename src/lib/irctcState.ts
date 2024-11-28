import { IRCTC } from 'train-book-web';

// Maps to store IRCTC instances and user-specific parameters
const irctcInstances = new Map<string, IRCTC>();
const userParams = new Map<string, { initialParams: Record<string, any>; params: Record<string, any> }>();

/**
 * Get or create an IRCTC instance for a user
 * @param userID - User ID
 * @param password - Password
 * @returns IRCTC instance
 */
export async function getOrCreateInstance(userID: string, password: string): Promise<IRCTC> {
    if (irctcInstances.has(userID)) {
        return irctcInstances.get(userID) as IRCTC;
    }
    const irctc = new IRCTC({ userID, password });
    irctcInstances.set(userID, irctc);
    return irctc;
}

/**
 * Get or initialize user-specific state
 * @param userID - User ID
 * @returns User-specific state object
 */
export function getOrInitializeUserState(userID: string): { initialParams: Record<string, any>; params: Record<string, any> } {
    if (!userParams.has(userID)) {
        userParams.set(userID, { initialParams: {}, params: {} });
    }
    return userParams.get(userID)!;
}

/**
 * Clear user-specific state and IRCTC instance
 * @param userID - User ID
 */
export function clearUserState(userID: string): void {
    userParams.delete(userID);
    irctcInstances.delete(userID);
}
