import express from 'express';
import cors from 'cors';
import {
    deleteMemberById, existsMemberByContactNotId,
    existsMemberById,
    findMembers,
    getMemberById,
    saveMember,
    updateMember
} from "../repository/member-repository";
import {Member} from "../dto/member";

export const router = express.Router();
router.use(cors());

router.post('/', async (req, res) => {
    const member = req.body as Member;

    if (await existsMemberById(member._id)){
        res.status(409).send("NIC already exists");
        return;
    }
    if (await existsMemberByContactNotId(member.contact, member._id)){
        res.status(409).send("Contact number already associated with another member");
        return;
    }

    await saveMember(req.body);
    res.sendStatus(201);
});

router.patch('/:memberId', async (req, res) => {
    const member = req.body as Member;
    member._id = req.params['memberId'];

    if (!await existsMemberById(member._id)){
        res.status(404).send("Member doesn't exist");
        return;
    }
    if (await existsMemberByContactNotId(member.contact, member._id)){
        res.status(409).send("Contact number already associated with another member");
        return;
    }

    await updateMember(member);
    res.sendStatus(204);
});

router.delete('/:memberId', async (req, res) => {

    if (!await existsMemberById(req.params.memberId)){
        res.status(404).send("Member doesn't exist");
        return;
    }

    await deleteMemberById(req.params.memberId);
    res.sendStatus(204);
});

router.get('/:memberId', async (req, res) => {
    const member = await getMemberById(req.params.memberId);

    if (member){
        res.json(member);
    }else{
        res.status(404).send("Member doesn't exist");
    }
});

router.get('/', async (req, res) => {
    const query = req.query.q ?? '';
    const memberList = await findMembers(query as string);
    res.json(memberList);
});