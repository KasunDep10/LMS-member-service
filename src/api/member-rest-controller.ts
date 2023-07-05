import express, {json} from "express";
import cors from 'cors';
import {Collection, MongoClient} from "mongodb";
import env from 'dotenv';
import {Member} from "../dto/member";

env.config();

const mongo = new MongoClient(process.env.APP_DB_URL!);
let memberRepo: Collection<Member>;

async function main() {
    await mongo.connect();
    console.log('Connected successfully to mongodb server');
    const db = mongo.db(process.env.APP_DB_NAME);
    memberRepo = db.collection('member');
}

main();


export const router = express.Router();

router.use(cors());
router.use(json());


function validateMember(member:Member){
    const validationErrors: Array<{field:string, error:string}> = [];

    if(!member._id?.trim())
        validationErrors.push({ field: "_id",  error: "Member ID can't be empty"});
    if(/^\d{9}[Vv]$/.test(member._id))
        validationErrors.push({ field: "_id",  error: "Member ID should be a valid NIC"});

    if(!member.name?.trim())
        validationErrors.push( { field: "name",  error: "Member Name can't be empty"});
    if(/[A-Za-z ]+/.test(member.name))
        validationErrors.push({ field: "name",  error: "Invalid member Name"});

    if(!member.address?.trim())
        validationErrors.push({ field: "address",  error: "Member Address can't be empty"});

    if(!member.contact?.trim())
        validationErrors.push({ field: "contact",  error: "Member Contact number can't be empty"});
    if(/^\d{3}-\d{7}$/.test(member.contact))
        validationErrors.push({ field: "contact",  error: "Invalid member contact number"});

    return validationErrors;
}


router.post("/", async (req, res, next)=>{
    try{
        const member = req.body as Member;
        const validationErrorList = validateMember(member);

        if(validationErrorList.length){
            throw {name:'validation', errors: validationErrorList}
        }


        if(await memberRepo.find({_id:member._id})){
            throw {name:'conflict', message: `NIC=${member._id} already exists`};
        } else if ( await memberRepo.findOne({contact:member.contact})){
            throw {name:'conflict', message: `Contact=${member.contact} already exists`};
        }

        await memberRepo.insertOne(member);
        res.sendStatus(201);

    }catch (e:any){
        if(e.name === 'validation'){
            res.status(400).json(e.errors);
        } else if (e.name === 'conflict'){
            res.status(409).json(e.errors);
        }else {
            next(e);
        }
    }

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


router.get("/", async (req, res)=>{
    res.json(await memberRepo.find({}).toArray());
});
