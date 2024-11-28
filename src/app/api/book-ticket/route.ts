import { NextResponse } from 'next/server';
import { IRCTC, login, getBookingCaptcha, confirmBooking, payment_mode_selection } from 'train-book-web';
import { BookingFormData } from '@/types/irctc';
import { getOrCreateInstance, getOrInitializeUserState, clearUserState } from '@/lib/irctcState';

export async function POST(request: Request) {
    let body: BookingFormData;

    try {
        body = await request.json();
        const { userID, password, loginCaptchaAnswer, bookingCaptchaAnswer, params1, ...bookingParams } = body;

        if (!userID) {
            throw new Error("Missing userID");
        }

        const irctc = await getOrCreateInstance(userID, password);
        const userState = getOrInitializeUserState(userID);

        if (!loginCaptchaAnswer && !bookingCaptchaAnswer) {
            userState.initialParams = await irctc.initializeBooking(bookingParams);
            return NextResponse.json({ success: true, data: userState.initialParams });
        }

        if (loginCaptchaAnswer && !bookingCaptchaAnswer) {
            userState.params = { ...params1.data, ...irctc };
            userState.params = await login(userState.params, 3, loginCaptchaAnswer);
            userState.params = await irctc.booking2(userState.params);
            const bookingCaptchaImg = await getBookingCaptcha(userState.params);

            return NextResponse.json({ success: true, data: userState.params, bookingCaptcha: bookingCaptchaImg });
        }

        if (bookingCaptchaAnswer) {
            const confirmedParams = await confirmBooking(userState.params, bookingCaptchaAnswer);
            const response = await payment_mode_selection(confirmedParams);

            clearUserState(userID);
            return NextResponse.json({ success: true, data: response });
        }

        throw new Error("Invalid request state");
    } catch (error: any) {
        console.error("Error during booking process:", error.message);
        if (body?.userID) {
            clearUserState(body.userID);
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
