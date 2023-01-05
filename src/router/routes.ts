import { Router, Request, Response } from 'express'
import auth from '../middlewares/auth'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  const { username } = req.session
  res.render('pages/index', { username, title: 'HomeX' })
})

router.get('/login', (req: Request, res: Response) => {
  const { username } = req.session
  res.render('pages/login', { username, title: 'HomeX | Login' })
})

router.get('/register', (req: Request, res: Response) => {
  const { username } = req.session
  res.render('pages/register', { username, title: 'HomeX | Register' })
})

router.get('/dashboard', auth, (req: Request, res: Response) => {
  const { username } = req.session
  res.render('dashboard/index', { username, title: 'HomeX | My Properties' })
})

export default router
