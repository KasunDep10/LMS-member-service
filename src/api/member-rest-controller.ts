import express, {json} from "express";
import cors from 'cors';

export const router = express.Router();

router.use(json());
router.use(cors());

router.post("/", (req, res)=>{
    res.send("<h1>Save member</h1>");
});

router.patch("/:memberId", (req, res)=>{
    res.send("<h1>Update member</h1>");
});

router.delete("/:memberId", (req, res)=>{
    res.send("<h1>Delete member</h1>");
});

router.get("/:memberId", (req, res)=>{
    res.send("<h1>Get member</h1>");
});

router.get("/", (req, res)=>{
    res.send("<h1>Find members</h1>");
});
