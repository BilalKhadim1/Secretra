import { google } from 'googleapis';
import { PrismaClient } from '@ps/db';

const prisma = new PrismaClient();

// Load credentials from environment
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/auth/google/callback';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

export class GoogleCalendarService {
  /**
   * Generates the URL for the user to authorize the app
   */
  static getAuthUrl(userId: string) {
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar.events.readonly',
        'https://www.googleapis.com/auth/calendar.readonly'
      ],
      state: userId, // Pass userId in state to verify on callback
      prompt: 'consent' // Force consent to get refresh token
    });
  }

  /**
   * Exchanges authorization code for tokens and saves them to the DB
   */
  static async handleCallback(userId: string, code: string) {
    const { tokens } = await oauth2Client.getToken(code);
    
    // Extract providerId (sub) from id_token if available
    let providerId = 'unknown';
    if (tokens.id_token) {
      const ticket = await oauth2Client.verifyIdToken({
        idToken: tokens.id_token,
        audience: CLIENT_ID,
      });
      providerId = ticket.getPayload()?.sub || 'unknown';
    }

    // Save to OAuthAccount table
    return prisma.oAuthAccount.create({
      data: {
        userId,
        provider: 'google',
        providerId,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      }
    });
  }

  /**
   * Syncs Google events into the local database
   */
  static async syncEvents(userId: string) {
    // 1. Get tokens from DB
    const account = await prisma.oAuthAccount.findFirst({
      where: { userId, provider: 'google' }
    });

    if (!account) throw new Error('Google account not linked');

    // 2. Setup auth
    oauth2Client.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken!,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 3. Fetch events
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const googleEvents = response.data.items || [];

    // 4. Upsert into local DB
    for (const gEvent of googleEvents) {
      if (!gEvent.summary) continue;

      await prisma.event.upsert({
        where: { id: gEvent.id || undefined }, // This needs care with UUIDs
        create: {
          userId,
          title: gEvent.summary,
          description: gEvent.description,
          startAt: new Date(gEvent.start?.dateTime || gEvent.start?.date!),
          endAt: new Date(gEvent.end?.dateTime || gEvent.end?.date!),
          googleEventId: gEvent.id,
          priority: 'medium',
        },
        update: {
          title: gEvent.summary,
          startAt: new Date(gEvent.start?.dateTime || gEvent.start?.date!),
          endAt: new Date(gEvent.end?.dateTime || gEvent.end?.date!),
        }
      });
    }

    return googleEvents.length;
  }
}
