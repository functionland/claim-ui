import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join, isAbsolute } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { isValid: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get emails file path from environment variable or use default
    const configuredPath = process.env.EMAILS_FILE_PATH || 'emails.txt';

    // Handle both absolute and relative paths
    const emailsFilePath = isAbsolute(configuredPath)
      ? configuredPath
      : join(process.cwd(), configuredPath);

    // Check if file exists
    if (!existsSync(emailsFilePath)) {
      console.error(`Emails file not found at: ${emailsFilePath}`);
      return NextResponse.json(
        { isValid: false, error: 'Email validation service unavailable' },
        { status: 500 }
      );
    }

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
