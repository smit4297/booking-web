// src/types/irctc.ts
export interface Passenger {
  name: string;
  age: number;
  gender: 'M' | 'F' | 'T';
}

export interface BookingFormData {
  userID: string;
  password: string;
  payment: string;
  class: string;
  quota: 'GN' | 'TQ' | 'PT';
  train: string;
  from: string;
  to: string;
  date: string;
  mobile: string;
  passengers: Passenger[];
  params1:any;
  loginCaptchaAnswer?: string;  // For login captcha answer
  bookingCaptchaAnswer?: string; // For booking captcha answer
}


export interface InitializeBookingResponse {  // For the initial booking step
  tid: string;
  csrf?: string; // If you need to return csrf from initialization
  // ... other data as needed ...
}

export interface CaptchaResponse {
captchaImage: string;  // Base64 encoded captcha image
}



export interface BookingResponse {
  success: boolean;
  data?: any;
  error?: string;
}