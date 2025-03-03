import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('API endpoint initialized'); // Logging for debugging

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[API] ${req.method} /api/events`, req.query); // Enhanced logging

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Methods', ['GET', 'POST', 'DELETE']);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const events = await prisma.event.findMany({
        include: {
          comments: true,
          files: true,
        },
        orderBy: {
          startTime: 'asc',
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
        include: {
          comments: true,
          files: true,
        },
      });

      console.log('Event created successfully:', event.id); // Logging for debugging
      res.status(201).json(event);
    } catch (error) {
      console.error('Error creating event:', error); // Logging for debugging
      res.status(500).json({ error: 'Failed to create event' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      console.log('Attempting to delete event:', id); // Logging for debugging
      
      if (!id || typeof id !== 'string') {
        console.error('Invalid event ID:', id); // Logging for debugging
        return res.status(400).json({ error: 'Event ID is required' });
      }

      // First, check if the event exists
      const event = await prisma.event.findUnique({
        where: { id },
      });

      if (!event) {
        console.error('Event not found:', id); // Logging for debugging
        return res.status(404).json({ error: 'Event not found' });
      }

      // Delete the event and its related records
      await prisma.event.delete({
        where: { id },
      });

      console.log('Event deleted successfully:', id); // Logging for debugging
      res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Error deleting event:', error); // Logging for debugging
      res.status(500).json({ error: 'Failed to delete event' });
    }
  } else {
    console.log('Method not allowed:', req.method); // Logging for debugging
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 