import { Hono } from 'hono'
import authRouter  from './SignInRoutes/index'
import blogRouter from './blogRoutes/index'
const app = new Hono()



app.route('/api/v1/',authRouter);
app.route('/api/v1/blog', blogRouter);

app.get('/', (c) => {
  return c.text('Welocme to Medium App')
})

export default app
