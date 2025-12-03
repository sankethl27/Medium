import { Hono } from 'hono';
// ✅ Correct import for the class type
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { sign } from 'hono/jwt';

const authRouter = new Hono<{
  Bindings: {
    ACCELERATE_URL: string;
    SECRET_KEY: string;
    DATABASE_URL : string
  };
}>();


authRouter.post('/signup', async (c) => {
  try {
    const body = await c.req.json();

    if (!body.email || !body.password) {
      c.status(400);
      return c.json({ error: 'Missing required fields.' });
    }

     const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password // ⚠️ should be hashed in production
      }
    });

    const token = await sign({ id: user.id }, c.env.SECRET_KEY);

    return c.json({ token });
  } catch (e: any) {
    console.error('Critical Runtime Error:', e);

    if (e.code === 'P2002') {
      c.status(409);
      return c.json({ error: 'A user with this email already exists.' });
    }

    c.status(500);
    return c.json({
      error: 'Internal server error.',
      details: e.message
    });
  }
});

authRouter.post('/signin', async (c) => {
  try {
    const body = await c.req.json();

    if (!body.email || !body.password) {
      c.status(400);
      return c.json({ error: 'Missing required fields.' });
    }

    const prisma = createPrismaClient(c.env.ACCELERATE_URL);

    const user = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (!user) {
      c.status(403);
      return c.json({ error: 'User not found' });
    }

    // ⚠️ In production, verify hashed password here
    // e.g. const valid = await bcrypt.compare(body.password, user.password)

    const token = await sign({ id: user.id }, c.env.SECRET_KEY);

    return c.json({ token });
  } catch (e: any) {
    console.error('Signin Error:', e);
    c.status(500);
    return c.json({
      error: 'Internal server error.',
      details: e.message
    });
  }
});

export default authRouter;
