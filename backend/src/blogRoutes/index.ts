import { Hono } from 'hono'
import { authMiddleWare } from '../Middlewares/authMiddleware'
const blogRouter = new Hono();

blogRouter.post('/', authMiddleWare, (c)=>{
    
})

blogRouter.put('/', authMiddleWare, (c)=>{
    
})

blogRouter.get('/', authMiddleWare, (c)=>{
    
})

export default blogRouter;