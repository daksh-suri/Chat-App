import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function searchUsers(req, res, next) {
    try {
        const query = (req.query.q || '').trim();

        if (!query) {
            return res.status(200).json([]);
        }

        const users = await prisma.user.findMany({
            where: {
                id: { not: req.user.id },
                OR: [
                    { email: { contains: query, mode: 'insensitive' } },
                    { name: { contains: query, mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                name: true,
                email: true
            },
            take: 8
        });

        res.status(200).json(users);
    } catch (error) {
        res.status(400).json({ message: error?.message || 'Error searching users' });
    }
}

export async function getFriends(req, res, next) {
    try {
        let allFriends = await prisma.directConversation.findMany({
            where: {
                OR: [
                    { userAId: req.user.id },
                    { userBId: req.user.id }
                ]
            },
            include: {
                userA: { select: { id: true, name: true, email: true } },
                userB: { select: { id: true, name: true, email: true } }
            }
        })
        res.status(200).json(allFriends);
    } catch (error) {
        res.status(400).json({ message: error?.message || 'Error fetching friends' });
    }
}

export async function ensureConversation(req, res, next) {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'Missing userId' });
        }

        const [a, b] = [req.user.id, userId].sort();

        let conversation = await prisma.directConversation.findUnique({
            where: { userAId_userBId: { userAId: a, userBId: b } },
            include: {
                userA: { select: { id: true, name: true, email: true } },
                userB: { select: { id: true, name: true, email: true } }
            }
        });

        if (!conversation) {
            conversation = await prisma.directConversation.create({
                data: { userAId: a, userBId: b },
                include: {
                    userA: { select: { id: true, name: true, email: true } },
                    userB: { select: { id: true, name: true, email: true } }
                }
            });
        }

        const peer = conversation.userA.id === req.user.id ? conversation.userB : conversation.userA;

        res.status(200).json({ conversation, peer });
    } catch (error) {
        res.status(400).json({ message: error?.message || 'Error opening conversation' });
    }
}

export async function getMessages(req, res, next) {
    try {
        const { conversationId } = req.query;
        let allMessages = await prisma.message.findMany({
            where: {
                conversationId
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        })
        res.status(200).json(allMessages);
    } catch (error) {
        res.status(400).json({message : error?.message || 'Error fetching messages'});
    }
}
