"use client"
import React, { useState } from 'react';
import { AlertCircle, Train, User } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    BookingFormData,
    BookingResponse,
    Passenger,
    InitializeBookingResponse,
    CaptchaResponse
} from '@/types/irctc';
import { SearchSelectInput } from './SearchSelectInput';

interface ClassOption {
  value: string;
  label: string;
}

interface QuotaOption {
  value: 'GN' | 'TQ' | 'PT';
  label: string;
}

export const IrctcBookingForm: React.FC = () => {
  const initialPassenger: Passenger = {
    name: '',
    age: 0,
    gender: 'M'
  };

  const [formData, setFormData] = useState<BookingFormData>({
    userID: '',
    password: '',
    payment: '',
    class: '',
    quota: 'GN',
    train: '',
    from: '',
    to: '',
    date: '',
    mobile: '',
    params1:{},
    passengers: [initialPassenger]
  });

  const [captchaInput, setCaptchaInput] = useState<string>('');
  const [bookingResponse, setBookingResponse] = useState<BookingResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loginCaptcha, setLoginCaptcha] = useState<string | null>(null);
  const [bookingCaptcha, setBookingCaptcha] = useState<string | null>(null);
  const [loginComplete, setLoginComplete] = useState<boolean>(false);
  const [bookingInitialized, setBookingInitialized] = useState<boolean>(false);
  const [initializationData, setInitializationData] = useState<InitializeBookingResponse | null>(null);

  const classOptions: ClassOption[] = [
    { value: '2A', label: '2-Tier AC' },
    { value: '3A', label: '3-Tier AC' },
    { value: 'SL', label: 'Sleeper' },
    { value: 'CC', label: 'Chair Car' },
    { value: '2S', label: 'Second Sitting' },
    { value: 'FC', label: 'First Class' },
    { value: '1A', label: 'First AC' },
    { value: '3E', label: '3-Tier Economy' }
  ];

  const quotaOptions: QuotaOption[] = [
    { value: 'GN', label: 'General' },
    { value: 'TQ', label: 'Tatkal' },
    { value: 'PT', label: 'Premium Tatkal' }
  ];

  const maxPassengers = formData.quota === 'GN' ? 8 : 4;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for date field
    if (name === 'date') {
      // Store the formatted date without hyphens
      const formattedDate = value.replace(/-/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: formattedDate
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePassengerChange = (index: number, field: keyof Passenger, value: string | number) => {
    const newPassengers = [...formData.passengers];
    newPassengers[index] = {
      ...newPassengers[index],
      [field]: field === 'age' ? parseInt(value as string) || 0 : value
    };
    setFormData(prev => ({
      ...prev,
      passengers: newPassengers
    }));
  };

  const addPassenger = () => {
    if (formData.passengers.length < maxPassengers) {
      setFormData(prev => ({
        ...prev,
        passengers: [...prev.passengers, { ...initialPassenger }]
      }));
    }
  };

  const removePassenger = (index: number) => {
    setFormData(prev => ({
      ...prev,
      passengers: prev.passengers.filter((_, i) => i !== index)
    }));
  };


   const handleSubmit = async (e: React.FormEvent) => { // Initial form submission
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
        const response = await fetch('/api/book-ticket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userID: formData.userID,
                password: formData.password,
                ...initializationData,
                ...formData

            })
        });

        const data: any = await response.json();
      //  console.log("---------------------------------------" + JSON.stringify(data) + response)

        setInitializationData(data);
        setBookingInitialized(true);
        console.log("formData.userID" + formData.userID)
        // Get Login Captcha
        const loginCaptchaResponse = await fetch('/api/get-login-captcha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
               
                body: JSON.stringify({userID: formData.userID, csrf: data.data , password:formData.password })
        });

        const loginCaptchaData: CaptchaResponse = await loginCaptchaResponse.json();
        setLoginCaptcha(loginCaptchaData.captchaImage);

    } catch (error) {
        setError(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
    }
};

const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const loginResponse = await fetch('/api/book-ticket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...formData,
                loginCaptchaAnswer: captchaInput,
                params1: initializationData,
                userID: formData.userID,
                password: formData.password
            })
        });
        const loginData = await loginResponse.json();
        if (!loginData.success) {
            throw new Error(loginData.error);
        }
        setLoginComplete(true);
        setLoginCaptcha(null);
        setCaptchaInput('');
        setBookingCaptcha(loginData.bookingCaptcha)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
    }
};


const handleFinalSubmit = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const finalBookingResponse = await fetch('/api/book-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        bookingCaptchaAnswer: captchaInput,
        userID: formData.userID,
        password: formData.password,
        ...initializationData
      }),
    });
    const bookingResponseData: BookingResponse = await finalBookingResponse.json()
    if(!bookingResponseData.success) {
      throw new Error(bookingResponseData.error)
    }
    setBookingResponse(bookingResponseData)


  } catch (error) {
     // ... handle error ...
     setError(error instanceof Error ? error.message : 'An unknown error occurred.');

  } finally {
    setIsLoading(false);
  }
};


  // Rest of the JSX remains the same as in the previous version, 
  // just add proper type annotations where TypeScript requires them
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Train className="h-6 w-6" />
            IRCTC Train Ticket Booking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Login Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">User ID</label>
                <input
                  type="text"
                  name="userID"
                  value={formData.userID}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>

            {/* Journey Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Train Number</label>
                <input
                  type="text"
                  name="train"
                  value={formData.train}
                  onChange={handleInputChange}
                  pattern="\d{5}"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <SearchSelectInput
                label="From Station"
                name="from" // Name matches the key in formData
                value={formData.from} // Bind value from formData
                onChange={handleInputChange} // Update formData
                placeholder="Search station"
              />

              <SearchSelectInput
                label="To Station"
                name="to" // Name matches the key in formData
                value={formData.to} // Bind value from formData
                onChange={handleInputChange} // Update formData
                placeholder="Search station"
              />

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Travel Date</label>
                <input
                    type="date"
                    name="date"
                    // Convert the YYYYMMDD format back to YYYY-MM-DD for the input
                    value={formData.date ? `${formData.date.slice(0, 4)}-${formData.date.slice(4, 6)}-${formData.date.slice(6, 8)}` : ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                    />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Class</label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Class</option>
                  {classOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quota</label>
                <select
                  name="quota"
                  value={formData.quota}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  {quotaOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Payment and Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">UPI ID</label>
                <input
                  type="text"
                  name="payment"
                  value={formData.payment}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mobile Number</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  pattern="\d{10}"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>

            {/* Passenger Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Passenger Details
                </h3>
                {formData.passengers.length < maxPassengers && (
                  <button
                    type="button"
                    onClick={addPassenger}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Add Passenger
                  </button>
                )}
              </div>

              {formData.passengers.map((passenger, index) => (
                <div key={index} className="p-4 border rounded space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Passenger {index + 1}</h4>
                    {formData.passengers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePassenger(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input
                        type="text"
                        value={passenger.name}
                        onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Age</label>
                      <input
                        type="number"
                        value={passenger.age}
                        onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                        min="1"
                        max="120"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Gender</label>
                      <select
                        value={passenger.gender}
                        onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="T">Transgender</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {bookingInitialized && (
                <div className="space-y-6 p-4 bg-gray-100 rounded-lg shadow-md">
                    {/* Login Captcha Section */}
                    {loginCaptcha && !loginComplete && (
                        <div className="space-y-4 border border-gray-300 p-4 rounded-md bg-white">
                            <div className="bg-black p-2 rounded-md">
                                <img
                                    src={`data:image/jpeg;base64,${loginCaptcha}`}
                                    alt="Login Captcha"
                                    className="block mx-auto rounded-md"
                                />
                            </div>
                            <Input
                                type="text"
                                value={captchaInput}
                                onChange={(e) => setCaptchaInput(e.target.value)}
                                placeholder="Enter login captcha"
                                className="w-full"
                            />
                            <Button
                                onClick={handleLogin}
                                disabled={!captchaInput || isLoading}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                            >
                                Login
                            </Button>
                        </div>
                    )}

                    {/* Booking Captcha Section */}
                    {bookingCaptcha && loginComplete && (
                        <div className="space-y-4 border border-gray-300 p-4 rounded-md bg-white">
                            <div className="bg-black p-2 rounded-md">
                                <img
                                    src={`data:image/jpeg;base64,${bookingCaptcha}`}
                                    alt="Booking Captcha"
                                    className="block mx-auto rounded-md"
                                />
                            </div>
                            <Input
                                type="text"
                                value={captchaInput}
                                onChange={(e) => setCaptchaInput(e.target.value)}
                                placeholder="Enter booking captcha"
                                className="w-full"
                            />
                            <Button
                                onClick={handleFinalSubmit}
                                disabled={!captchaInput || isLoading}
                                className="w-full bg-green-500 hover:bg-green-600 text-white"
                            >
                                Confirm Booking
                            </Button>
                        </div>
                    )}

                    {/* Display booking response or errors */}
                    {bookingResponse?.data?.body?.userDetaillastTxnStatus && (
                        <Alert className="bg-green-50 text-green-700 border border-green-300">
                            <AlertTitle>Booking Response</AlertTitle>
                            <AlertDescription>
                                <pre className="whitespace-pre-wrap">{bookingResponse.data.body.userDetaillastTxnStatus || `not booked`}</pre>
                            </AlertDescription>
                        </Alert>
                    )}

                    {bookingResponse?.data?.body.bookingResponseDTO[0]?.psgnDtlList[0]?.bookingStatusDetails && (
                        <Alert className="bg-green-50 text-green-700 border border-green-300">
                            <AlertTitle>Booking Response</AlertTitle>
                            <AlertDescription>
                                <pre className="whitespace-pre-wrap">{bookingResponse.data.body.bookingResponseDTO[0].psgnDtlList[0].bookingStatusDetails || `booked`}</pre>
                            </AlertDescription>
                        </Alert>
                    )}

                    {error && (
                        <Alert className="bg-red-50 text-red-700 border border-red-300">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>
            )}



            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? 'Processing...' : 'Book Ticket'}
            </button>
          </form>

          {/* Booking Response Display */}
          {bookingResponse && (
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                  {JSON.stringify(bookingResponse, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
      
    </div>
  );
};