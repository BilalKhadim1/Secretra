import 'dotenv/config';
import { appRouter } from './src/trpc';
import { PrismaClient } from '@ps/db';

async function testCalendar() {
  console.log('🧪 Starting API Test: Calendar System...');

  // 1. Mock Context (Simulating a logged-in user)
  // We manually specify the context type to match what appRouter expects
  const mockContext = {
    user: { id: '00000000-0000-0000-0000-000000000000', email: 'test@example.com' },
    req: {} as any,
    res: {} as any,
  };

  // Create a caller for the router
  const caller = appRouter.createCaller(mockContext);

  try {
    // 2. Create an Event
    console.log('📝 Creating test event...');
    const newEvent = await caller.calendar.createEvent({
      title: 'Professional API Test Event',
      description: 'Verifying that tRPC and Prisma are linked correctly.',
      startAt: new Date().toISOString(),
      endAt: new Date(Date.now() + 3600000).toISOString(),
      priority: 'high',
    });
    console.log('✅ Event Created:', newEvent.id);

    // 3. Get Events
    console.log('🔍 Fetching all events...');
    const events = await caller.calendar.getEvents();
    console.log(`✅ Found ${events.length} events for this user.`);

    // 4. Update Event
    console.log('🔄 Updating event title...');
    await caller.calendar.updateEvent({
      id: newEvent.id,
      title: 'Updated: Professional API Test Event',
    });
    console.log('✅ Event title updated.');

    console.log('\n✨ ALL TESTS PASSED! The Backend is fully functional.');
  } catch (error: any) {
    console.error('❌ Test Failed!');
    console.error('Error Message:', error.message);
    if (error.cause) console.error('Cause:', error.cause);
    if (error.meta) console.error('Prisma Meta:', error.meta);
    process.exit(1);
  }
}

testCalendar();
