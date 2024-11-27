import { NextResponse } from 'next/server';
import { IRCTC, login, getBookingCaptcha, confirmBooking, payment_mode_selection } from 'train-book-web';
import { BookingFormData } from '@/types/irctc';

 const irctcInstances = new Map<string, IRCTC>();

// @ts-ignore
export async function getOrCreateInstance(userID: string, password: string): Promise<IRCTC> {
    if (irctcInstances.has(userID)) {
        return irctcInstances.get(userID) as IRCTC;
    }
    const irctc = new IRCTC({ userID, password });
    irctcInstances.set(userID, irctc);
    return irctc;
}

let initialParams: Record<string, any> = {};
let params: Record<string, any> = {}; 


export async function POST(request: Request) {
  let body: BookingFormData; 


  try {
      body = await request.json(); 

      const { userID, password, loginCaptchaAnswer, bookingCaptchaAnswer, params1, ...bookingParams } = body;

      const irctc = await getOrCreateInstance(userID, password);

      if (!loginCaptchaAnswer && !bookingCaptchaAnswer) {
    

          initialParams = await irctc.initializeBooking(bookingParams);

          return NextResponse.json({ success: true, data: initialParams });
      } 
      
      if (loginCaptchaAnswer && !bookingCaptchaAnswer) {
          // Ensure initialParams are included before making further calls
          params = {...params1.data, ...irctc}
          params = await login(params, 3, loginCaptchaAnswer);

          // params = { ...initialParams, ...params, ...bookingParams, ...params1, browse: irctc.browse }; 

          params = await irctc.booking2(params); 
          const bookingCaptchaImg = await getBookingCaptcha( params);

          return NextResponse.json({ success: true, data: params, bookingCaptcha: bookingCaptchaImg });
      } 
      
      if (bookingCaptchaAnswer) {

        
          // Pass all accumulated params into the final booking stage
          const confirmedParams = await confirmBooking(params, bookingCaptchaAnswer);


          const response = await payment_mode_selection(confirmedParams);

          return NextResponse.json({ success: true, data: response });
      }

      throw new Error("Invalid request state");
  } catch (error: any) {
      console.error("Error during booking process:", error.message);

      if (body?.userID) {
          irctcInstances.delete(body.userID);
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


