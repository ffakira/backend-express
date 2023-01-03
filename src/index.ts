import * as dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import router from './router'
import mongoose from 'mongoose'
const app = express()
const { NODE_ENV } = process.env

// const storeStrategy = NODE_ENV === 'test' ? new MemoryStore() : new PgStore()
// const secure = NODE_ENV === 'development' || NODE_ENV === 'test' ? false : true
// app.use(
//   session({
//     store: storeStrategy as Store,
//     name: process.env.COOKIE_NAME,
//     secret: process.env.COOKIE_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       path: '/',
//       secure,
//       maxAge: ONE_DAY,
//       httpOnly: true
//     }
//   })
// )

mongoose.set('strictQuery', true)
mongoose.connect('mongodb://127.0.0.1/homex')

/** @dev addtional middlewares */
const morganEnv = NODE_ENV === 'development' ? 'dev' : 'combined'
app.use(morgan(morganEnv))

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: 'GET, POST, PATCH, DELETE'
  })
)

app.disable('x-powered-by')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/** @dev registerRoutes */
router(app)

export default app
