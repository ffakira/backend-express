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
  res.render('pages/register/index', { username, title: 'HomeX | Register' })
})

router.get('/successful', (req: Request, res: Response) => {
  const { username } = req.session
  res.render('pages/register/successful', {
    username,
    title: 'HomeX | Successful'
  })
})

router.get('/dashboard', auth, (req: Request, res: Response) => {
  const { username } = req.session
  res.render('dashboard/index', { username, title: 'HomeX | My Properties' })
})

// router.all('*', (req: Request, res: Response) => {
//   const { username } = req.session
//   res.status(404)
//   res.render('pages/error/404', { username, title: 'HomeX | 404' })
// })

export default router
