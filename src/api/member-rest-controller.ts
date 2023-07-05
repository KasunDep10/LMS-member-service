import express, {json} from 'express';
import cors from 'cors';
import {Collection, MongoClient} from "mongodb";
import env from 'dotenv';
import {Member} from "../dto/member";

env.config();

let memberRepo: Collection<Member>;

async function main(){
    const mongo = new MongoClient(process.env.APP_DB_URL!)
    await mongo.connect();
    console.log("Successfully connected to the Mongo DB Server!");
    memberRepo = mongo.db(process.env.APP_DB_NAME).collection('member');
}

main();

export const router = express.Router();

router.use(cors());
router.use(json());

function validateMember(member: Member){
    const validationErrors: Array<{field: string, error: string}> = [];

    if (!member._id?.trim())
        validationErrors.push({ field: '_id',  error: "Member id can't be empty" });
    if (!/^\d{9}[Vv]$/.test(member._id))
        validationErrors.push({ field: '_id',  error: "Member id should be a valid nic" });

    if (!member.name?.trim())
        validationErrors.push({ field: 'name',  error: "Member name can't be empty" });
    if (!/^[A-Za-z ]+$/.test(member.name))
        validationErrors.push( { field: 'name',  error: "Invalid member name" });

    if (!member.address?.trim())
        validationErrors.push( { field: 'address',  error: "Member address can't be empty" });

    if (!member.contact?.trim())
        validationErrors.push({ field: 'contact',  error: "Member contact can't be empty" });
    if (!/^\d{3}-\d{7}$/.test(member.contact))
        validationErrors.push( { field: 'contact',  error: "Invalid member contact number" });

    return validationErrors;
}

router.post('/', async (req, res, next) => {
    try{
        const member = req.body as Member;
        const validationErrorList = validateMember(member);
        if (validationErrorList.length) throw {name: 'validation', errors: validationErrorList};

        if (await memberRepo.findOne({_id: member._id})){
            throw {name: 'conflict', message: `NIC=${member._id} already exists`};
        }
        if (await memberRepo.findOne({contact: member.contact})){
            throw {name: 'conflict', message: `Contact=${member.contact} already exists`};
        }

        await memberRepo.insertOne(member);
        res.sendStatus(201);
    }catch (e:any){
        if (e.name === 'validation') {
            res.status(400).json(e.errors);
        }else if (e.name === 'conflict'){
            res.status(409).json(e.message);
        }else{
            next(e);
        }
    }
});

router.patch('/:memberId', async (req, res, next) => {
    try{
        const member = req.body as Member;
        member._id = req.params.memberId;
        const validationErrorList = validateMember(member);
        if (validationErrorList.length) throw {name: 'validation', errors: validationErrorList};

        if (!await memberRepo.findOne({_id: member._id}))
            throw {name: 'notfound', message: `NIC=${member._id} doesn't not exist`};

        if ((await memberRepo.findOne({contact: member.contact}))?._id !== member._id){
            throw {name: 'conflict', message: `contact=${member.contact} already associated with another member`};
        }

        await memberRepo.updateOne({_id: member._id}, {$set: member});
        res.sendStatus(204);
    }catch (e:any){
        if (e.name === 'validation') {
            res.status(400).json(e.errors);
        }else if (e.name === 'conflict') {
            res.status(409).json(e.message);
        }else if (e.name === 'notfound'){
            res.status(404).json(e.message);
        }else{
            next(e);
        }
    }
});

router.delete('/:memberId', async(req, res, next) => {
    try{
        if (!await memberRepo.findOne({_id: req.params.memberId}))
            throw {name: 'notfound', message: `NIC=${req.params.memberId} doesn't not exist`};

        await memberRepo.deleteOne({_id: req.params.memberId});
        res.sendStatus(204);
    }catch (e:any){
        if (e.name === 'validation') {
            res.status(400).json(e.errors);
        }else if (e.name === 'conflict') {
            res.status(409).json(e.message);
        }else if (e.name === 'notfound'){
            res.status(404).json(e.message);
        }else{
            next(e);
        }
    }
});

router.get('/:memberId', async (req, res,next) => {
    try{
        if (!await memberRepo.findOne({_id: req.params.memberId}))
            throw {name: 'notfound', message: `NIC=${req.params.memberId} doesn't not exist`};

        res.json(await memberRepo.findOne({_id: req.params.memberId}));
    }catch (e:any){
        if (e.name === 'validation') {
            res.status(400).json(e.errors);
        }else if (e.name === 'conflict') {
            res.status(409).json(e.message);
        }else if (e.name === 'notfound'){
            res.status(404).json(e.message);
        }else{
            next(e);
        }
    }
});

router.get('/', async (req, res) => {
    let query = req.query.q ?? '';
    res.json(await memberRepo.find({
        $or:[{_id: {$regex: `${query}`}}, {name: {$regex: `${query}`}},
            {address: {$regex: `${query}`}}, {contact: {$regex: `${query}`}}]
    }).toArray());
});