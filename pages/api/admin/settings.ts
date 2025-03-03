import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[API] ${req.method} /api/admin/settings`);

  try {
    if (req.method === 'GET') {
      const settings = await prisma.conferenceSettings.findUnique({
        where: { id: 'default' },
      });

      if (!settings) {
        // Create default settings if they don't exist
        const defaultSettings = await prisma.conferenceSettings.create({
          data: {
            id: 'default',
            startDate: new Date(2025, 6, 17),
            endDate: new Date(2025, 6, 22),
          },
        });
        return res.status(200).json(defaultSettings);
      }

      return res.status(200).json(settings);
    } else if (req.method === 'PUT') {
      const { startDate, endDate } = req.body;

      const updatedSettings = await prisma.conferenceSettings.upsert({
        where: { id: 'default' },
        update: {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
        create: {
          id: 'default',
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      });

      return res.status(200).json(updatedSettings);
    } else {
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error handling settings:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 