import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('Comments API endpoint initialized'); // Logging for debugging

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`Handling ${req.method} request to /api/comments`); // Logging for debugging

  if (req.method === 'POST') {
    try {
      const { content, eventId, authorName } = req.body;
      console.log('Creating new comment:', { eventId, authorName }); // Logging for debugging

      const comment = await prisma.comment.create({
        data: {
          content,
          eventId,
          authorName,
        },
      });

      console.log('Comment created successfully:', comment.id); // Logging for debugging
      res.status(201).json(comment);
    } catch (error) {
      console.error('Error creating comment:', error); // Logging for debugging
      res.status(500).json({ error: 'Failed to create comment' });
    }
  } else if (req.method === 'GET') {
    try {
      const { eventId } = req.query;
      console.log('Fetching comments for event:', eventId); // Logging for debugging

      if (!eventId) {
        console.log('No eventId provided'); // Logging for debugging
        return res.status(400).json({ error: 'Event ID is required' });
      }

      const comments = await prisma.comment.findMany({
        where: {
          eventId: String(eventId),
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      console.log(`Retrieved ${comments.length} comments`); // Logging for debugging
      res.status(200).json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error); // Logging for debugging
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  } else {
    console.log('Method not allowed:', req.method); // Logging for debugging
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 