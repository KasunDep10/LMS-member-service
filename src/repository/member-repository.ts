import {datasource} from "../main";
import {Member} from "../dto/member";
import {Collection} from "mongodb";

export async function saveMember(member: Member){
    const memberRepo: Collection<Member> = datasource.collection('member');
    await memberRepo.insertOne(member);
}

export async function updateMember(member: Member){
    const memberRepo: Collection<Member> = datasource.collection('member');
    await memberRepo.updateOne({_id: member._id}, {$set: member})
}

export async function deleteMemberById(_id: string){
    const memberRepo: Collection<Member> = datasource.collection('member');
    await memberRepo.deleteOne({_id})
}

export async function getMemberById(_id: string) : Promise<Member | null> {
    const memberRepo: Collection<Member> = datasource.collection('member');
    return await memberRepo.findOne({_id});
}

export async function findMembers(query: string) : Promise<Array<Member>> {
    const memberRepo: Collection<Member> = datasource.collection('member');
    // SELECT * FROM member WHERE id LIKE ? OR name LIKE ? OR address LIKE ? OR contact LIKE ?
    // $or: []
    // $and: []
    // $regex: RegExp
    // $ne:
    // $lt
    // $lte
    // $gt
    // $gte
    return await memberRepo.find({
        $or:[
            {_id: {$regex: `${query}`}},
            {name: {$regex: `${query}`}},
            {address: {$regex: `${query}`}},
            {contact: {$regex: `${query}`}}]
    }).toArray();
}

export async function existsMemberById(_id: string): Promise<boolean>{
    const memberRepo: Collection<Member> = datasource.collection('member');
    return !!(await getMemberById(_id));
}

export async function existsMemberByContactNotId(contact: string, _id: string): Promise<boolean>{
    const memberRepo: Collection<Member> = datasource.collection('member');
    // SELECT * FROM member WHERE contact = :contact AND _id <> :_id
    return !!(await memberRepo.findOne({
        $and: [
            {contact},
            {_id: {$ne: _id}}
        ]
    }));
}