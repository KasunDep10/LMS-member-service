import express from 'express';
import env from 'dotenv';
import {router as MemberRouter} from './api/member-rest-controller';

env.config();
const app = express();
app.use("/api/v1/members", MemberRouter);

app.listen(process.env.APP_PORT, ()=>
    console.log(`Server has been started on ${process.env.APP_PORT}`));