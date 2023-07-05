import express from 'express';
import env from 'dotenv';

env.config();
const app = express();

app.listen(process.env.APP_PORT, ()=>
    console.log(`Server has been started on ${process.env.APP_PORT}`));