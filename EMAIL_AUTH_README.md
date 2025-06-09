# Email Authentication System

This portal now includes an email authentication system that requires users to enter their email address before accessing the main application.

## Features

- **Email Whitelist**: Only emails listed in the configured file can access the portal
- **Persistent Authentication**: Once authenticated, users won't need to re-enter their email (cached in localStorage)
- **Elegant Design**: Matches the existing branding and theme system
- **Error Handling**: Clear error messages for invalid emails or authentication failures
- **Configurable**: Email file path can be configured via environment variables

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# Email authentication configuration
EMAILS_FILE_PATH=emails.txt
```

**Options for `EMAILS_FILE_PATH`:**
- **Relative path**: `emails.txt` (relative to project root)
- **Absolute path**: `/path/to/your/emails.txt`
- **Custom location**: `config/whitelist.txt`

### Email File Format

Create a text file with one email address per line:

```
ehsan@fx.land
ehsan6sha@gmail.com
user@example.com
```

**Important Notes:**
- Email comparison is case-insensitive
- Empty lines are ignored
- No special formatting required

## How It Works

1. **First Visit**: User sees email input form
2. **Email Validation**: System checks if email exists in whitelist file
3. **Success**: Email is cached and user accesses main portal
4. **Failure**: Error message displayed with contact information
5. **Return Visits**: Cached email allows automatic access

## User Experience

### Email Gate Screen
- Clean, branded interface matching your portal design
- Email input field with validation
- Clear error messages
- Contact information for access requests

### Error Messages
- **Invalid email format**: "Please enter a valid email address"
- **Email not whitelisted**: "Your email is not in the whitelisted emails. Please contact hi@fx.land"
- **Server error**: "An error occurred. Please try again."

## Development

### Testing Different Emails

To test the system:

1. Add test emails to your emails file
2. Clear localStorage to reset authentication
3. Try accessing the portal with different emails

### Clearing Authentication

To reset authentication (for testing):
```javascript
// In browser console
localStorage.removeItem('authenticated_email');
```

## Deployment

### Production Setup

1. **Create emails file**: Place your production email list in the configured location
2. **Set environment variable**: Ensure `EMAILS_FILE_PATH` points to the correct file
3. **File permissions**: Ensure the application can read the emails file
4. **Security**: Keep the emails file secure and not publicly accessible

### Docker/Container Deployment

If using containers, ensure:
- Emails file is mounted or copied into the container
- Environment variable points to the correct path inside container
- File permissions are set correctly

## Security Considerations

- Email addresses are stored in localStorage (client-side)
- Server-side validation prevents unauthorized access
- No sensitive data is exposed in the authentication process
- Failed authentication attempts don't reveal valid email addresses

## Troubleshooting

### Common Issues

1. **"Email validation service unavailable"**
   - Check if emails file exists at configured path
   - Verify file permissions
   - Check server logs for detailed error

2. **Authentication not persisting**
   - Check if localStorage is enabled in browser
   - Verify no browser extensions are clearing storage

3. **Emails not being recognized**
   - Ensure email format in file is correct
   - Check for extra spaces or special characters
   - Verify case sensitivity (system converts to lowercase)

### Logs

Check server logs for detailed error messages:
```bash
npm run dev  # Development
# or check your production logs
```
