import { NextResponse } from 'next/server';
// import { getLoginCaptcha } from 'train-book-web'; // Import your function
import { getOrCreateInstance } from '../book-ticket/route' // Import the irctcInstances map
import { IRCTC, getLoginCaptcha, login, getBookingCaptcha, confirmBooking, payment_mode_selection } from 'train-book-web';



export async function POST(request: Request) {
    try {
       const { userID, csrf, password } = await request.json();
       const irctc : IRCTC = await getOrCreateInstance(userID, password); // Get the instance
       if (!irctc) {
        return NextResponse.json({ error: "IRCTC instance not found" }, { status: 400 });
        }

        const captchaImage = await getLoginCaptcha(irctc, csrf);
        return NextResponse.json({ captchaImage });
    } catch (error: any) {
        // ... error handling

        console.log(error)
        return NextResponse.json({ error: error.message }, { status: 500 }); 
    }
}