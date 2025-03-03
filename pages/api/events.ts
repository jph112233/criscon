import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[API] ${req.method} /api/events`, req.query);

  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Methods', ['GET', 'POST', 'DELETE', 'PUT']);
    
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
        console.log(`Retrieved ${events.length} events`);
        return res.status(200).json(events);
      } catch (error: any) {
        console.error('Database error fetching events:', error);
        return res.status(500).json({ 
          error: 'Failed to fetch events',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    } else if (req.method === 'POST') {
      try {
        const { title, description, startTime, endTime, location } = req.body;
        console.log('Creating new event:', { title, location });

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

        console.log('Event created successfully:', event.id);
        res.status(201).json(event);
      } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
      }
    } else if (req.method === 'PUT') {
      try {
        const { id } = req.query;
        const { title, description, startTime, endTime, location } = req.body;
        
        console.log('Updating event:', { id, title, location });

        if (!id || typeof id !== 'string') {
          return res.status(400).json({ error: 'Event ID is required' });
        }

        // Check if the event exists
        const existingEvent = await prisma.event.findUnique({
          where: { id },
        });

        if (!existingEvent) {
          return res.status(404).json({ error: 'Event not found' });
        }

        // Update the event
        const updatedEvent = await prisma.event.update({
          where: { id },
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

        console.log('Event updated successfully:', updatedEvent.id);
        res.status(200).json(updatedEvent);
      } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Failed to update event' });
      }
    } else if (req.method === 'DELETE') {
      try {
        const { id } = req.query;
        
        if (!id || typeof id !== 'string') {
          return res.status(400).json({ error: 'Event ID is required' });
        }

        // First, check if the event exists
        const event = await prisma.event.findUnique({
          where: { id },
        });

        if (!event) {
          return res.status(404).json({ error: 'Event not found' });
        }

        // Delete the event and its related records
        await prisma.event.delete({
          where: { id },
        });

        console.log('Event deleted successfully:', id);
        res.status(200).json({ message: 'Event deleted successfully' });
      } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('Unexpected API error:', error);
    return res.status(500).json({ 
      error: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 