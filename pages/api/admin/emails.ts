import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[API] ${req.method} /api/admin/emails`);

  try {
    if (req.method === 'GET') {
      const emails = await prisma.emailList.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
      return res.status(200).json(emails);
    } else if (req.method === 'POST') {
      const { email, name, role } = req.body;

      // Validate required fields
      if (!email || !name || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if email already exists
      const existingEmail = await prisma.emailList.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const newEmail = await prisma.emailList.create({
        data: {
          email,
          name,
          role,
        },
      });

      return res.status(201).json(newEmail);
    } else if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Email ID is required' });
      }

      // Check if email exists
      const email = await prisma.emailList.findUnique({
        where: { id },
      });

      if (!email) {
        return res.status(404).json({ error: 'Email not found' });
      }

      await prisma.emailList.delete({
        where: { id },
      });

      return res.status(200).json({ message: 'Email deleted successfully' });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error handling emails:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 