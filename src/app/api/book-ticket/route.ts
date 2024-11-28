// import { NextResponse } from 'next/server';
// import { IRCTC, login, getBookingCaptcha, confirmBooking, payment_mode_selection } from 'train-book-web';
// import { BookingFormData } from '@/types/irctc';
// import { getOrCreateInstance, getOrInitializeUserState, clearUserState } from '@/lib/irctcState';

// export async function POST(request: Request) {
//     let body: BookingFormData;

//     try {
//         body = await request.json();
//         const { userID, password, loginCaptchaAnswer, bookingCaptchaAnswer, params1, ...bookingParams } = body;

//         if (!userID) {
//             throw new Error("Missing userID");
//         }

//         const irctc = await getOrCreateInstance(userID, password);
//         const userState = getOrInitializeUserState(userID);

//         if (!loginCaptchaAnswer && !bookingCaptchaAnswer) {
//             userState.initialParams = await irctc.initializeBooking(bookingParams);
//             return NextResponse.json({ success: true, data: userState.initialParams });
//         }

//         if (loginCaptchaAnswer && !bookingCaptchaAnswer) {
//             userState.params = { ...params1.data, ...irctc };
//             userState.params = await login(userState.params, 3, loginCaptchaAnswer);
//             userState.params = await irctc.booking2(userState.params);
//             const bookingCaptchaImg = await getBookingCaptcha(userState.params);

//             return NextResponse.json({ success: true, data: userState.params, bookingCaptcha: bookingCaptchaImg });
//         }

//         if (bookingCaptchaAnswer) {
//             const confirmedParams = await confirmBooking(userState.params, bookingCaptchaAnswer);
//             const response = await payment_mode_selection(confirmedParams);

//             clearUserState(userID);
//             return NextResponse.json({ success: true, data: response });
//         }

//         throw new Error("Invalid request state");
//     } catch (error: any) {
//         console.error("Error during booking process:", error.message);
//         if (body?.userID) {
//             clearUserState(body.userID);
//         }
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }


import { NextResponse } from 'next/server';
import { IRCTC, login, getBookingCaptcha, confirmBooking, payment_mode_selection } from 'train-book-web';
import { BookingFormData } from '@/types/irctc';
import { getOrCreateInstance, getOrInitializeUserState, clearUserState } from '@/lib/irctcState';

export async function POST(request: Request) {
    let body: BookingFormData;

    try {
        // Log the incoming request details
        console.log('Incoming request body:', await request.clone().json());

        body = await request.json();
        const { userID, password, loginCaptchaAnswer, bookingCaptchaAnswer, params1, ...bookingParams } = body;

        console.log('Extracted request parameters:', {
            userID: userID ? 'PRESENT' : 'MISSING',
            hasPassword: !!password,
            loginCaptchaAnswer: !!loginCaptchaAnswer,
            bookingCaptchaAnswer: !!bookingCaptchaAnswer
        });

        if (!userID) {
            throw new Error("Missing userID");
        }

        console.log('Creating IRCTC instance for user:', userID);
        const irctc = await getOrCreateInstance(userID, password);
        console.log('IRCTC instance created successfully');

        const userState = getOrInitializeUserState(userID);
        console.log('User state initialized');

        if (!loginCaptchaAnswer && !bookingCaptchaAnswer) {
            console.log('Initializing booking with params:', bookingParams);
            userState.initialParams = await irctc.initializeBooking(bookingParams);
            console.log('Booking initialization successful');
            return NextResponse.json({ success: true, data: userState.initialParams });
        }

        if (loginCaptchaAnswer && !bookingCaptchaAnswer) {
            console.log('Attempting login with captcha answer');
            userState.params = { ...params1.data, ...irctc };
            
            console.log('Performing login...');
            userState.params = await login(userState.params, 3, loginCaptchaAnswer);
            console.log('Login successful');

            console.log('Performing booking2...');
            userState.params = await irctc.booking2(userState.params);
            console.log('Booking2 successful');

            console.log('Retrieving booking captcha...');
            const bookingCaptchaImg = await getBookingCaptcha(userState.params);
            console.log('Booking captcha retrieved');

            return NextResponse.json({ success: true, data: userState.params, bookingCaptcha: bookingCaptchaImg });
        }

        if (bookingCaptchaAnswer) {
            console.log('Confirming booking with captcha answer');
            const confirmedParams = await confirmBooking(userState.params, bookingCaptchaAnswer);
            console.log('Booking confirmation successful');

            console.log('Selecting payment mode...');
            const response = await payment_mode_selection(confirmedParams);
            console.log('Payment mode selection completed');

            clearUserState(userID);
            console.log('User state cleared');

            return NextResponse.json({ success: true, data: response });
        }

        throw new Error("Invalid request state");
    } catch (error: any) {
        console.error("Error during booking process:", error);
        console.error("Full error details:", {
            message: error.message,
            name: error.name,
            stack: error.stack
        });

        if (body?.userID) {
            console.log('Clearing user state due to error');
            clearUserState(body.userID);
        }

        return NextResponse.json({ 
            error: error.message,
            details: error.toString()
        }, { status: 500 });
    }
}
