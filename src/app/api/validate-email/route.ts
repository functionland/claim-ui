import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { isValid: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Read emails from the emails.txt file
    const emailsFilePath = join(process.cwd(), 'emails.txt');
    const emailsContent = readFileSync(emailsFilePath, 'utf-8');
    const whitelistedEmails = emailsContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // Check if the email is in the whitelist
    const isValid = whitelistedEmails.includes(email.toLowerCase());

    return NextResponse.json({ isValid });
  } catch (error) {
    console.error('Error validating email:', error);
    return NextResponse.json(
      { isValid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
