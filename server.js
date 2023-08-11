import express from 'express'
import  colors  from 'colors'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoute.js'
import categoryRoutes from './routes/categoryRoute.js'
import productRoutes from './routes/productRoutes.js'
import path from 'path'



//env config
dotenv.config()

//database config
connectDB()

//rest object
const app = express()

//middleware
app.use(express.json())
app.use(morgan('dev'))
app.use(cors())
app.use(express.static(path.json(__dirname,'./client/build')))

//routes
app.use('/api/v1/auth',authRoutes)
app.use('/api/v1/category',categoryRoutes)
app.use('/api/v1/product',productRoutes)

//rest api
app.use('*',function(req,res){
res.sendFile(path.join(__dirname('./client/build/index.html')))
})

//PORT
const PORT = process.env.PORT || PORT
app.listen(PORT,()=>{
  console.log(`Server running on ${process.env.DEV_MODE} mode on port ${PORT}` .bgCyan.white)
})