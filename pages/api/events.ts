import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('API endpoint initialized'); // Logging for debugging

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`Handling ${req.method} request to /api/events`); // Logging for debugging

  if (req.method === 'GET') {
    try {
      const events = await prisma.event.findMany({
        include: {
          comments: true,
          files: true,
        },
      });
      console.log(`Retrieved ${events.length} events`); // Logging for debugging
      res.status(200).json(events);
    } catch (error) {
      console.error('Error fetching events:', error); // Logging for debugging
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, description, startTime, endTime, location } = req.body;
      console.log('Creating new event:', { title, location }); // Logging for debugging

      const event = await prisma.event.create({
        data: {
          title,
          description,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          location,
        },
      });

      console.log('Event created successfully:', event.id); // Logging for debugging
      res.status(201).json(event);
    } catch (error) {
      console.error('Error creating event:', error); // Logging for debugging
      res.status(500).json({ error: 'Failed to create event' });
    }
  } else {
    console.log('Method not allowed:', req.method); // Logging for debugging
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 