import { NextResponse } from 'next/server';
import { IRCTC, getLoginCaptcha } from 'train-book-web';
import { getOrCreateInstance } from '@/lib/irctcState';

export async function POST(request: Request) {
    try {
        const { userID, csrf, password } = await request.json();

        if (!userID || !csrf || !password) {
            return NextResponse.json({ error: "Missing required fields (userID, csrf, password)" }, { status: 400 });
        }

        const irctc: IRCTC = await getOrCreateInstance(userID, password);
        const captchaImage = await getLoginCaptcha(irctc, csrf);

        return NextResponse.json({ captchaImage });
    } catch (error: any) {
        console.error("Error in login captcha generation:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
