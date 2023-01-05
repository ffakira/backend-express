/* eslint-disable @typescript-eslint/no-var-requires */
import * as dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import router from './router'
import mongoose from 'mongoose'
import session from 'express-session'
import { ONE_DAY } from './utils'
import MongoStore from 'connect-mongo'
import path from 'path'

const app = express()
const { NODE_ENV } = process.env

mongoose.set('strictQuery', true)
mongoose.connect('mongodb://127.0.0.1/homex')

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: 'mongodb://127.0.0.1/homex'
    }),
    name: process.env.COOKIE_NAME,
    secret: process.env.COOKIE_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      path: '/',
      secure: false,
      maxAge: ONE_DAY,
      httpOnly: true
    }
  })
)

/** @dev addtional middlewares */
const morganEnv = NODE_ENV === 'development' ? 'dev' : 'combined'
app.use(morgan(morganEnv))

app.use('/assets', express.static(path.join(__dirname, '../public')))
app.set('view engine', 'ejs')

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
