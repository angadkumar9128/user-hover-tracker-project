import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

let client;

export default async function handler(req,res){

    if(req.method!=="POST"){

        return res.status(405).json({
            error:"Method Not Allowed"
        });

    }

    try{

        if(!client){

            client=new MongoClient(uri);

            await client.connect();

        }

        const db=client.db("user_tracking");

        const collection=db.collection("user_events");

        const forwardedFor=req.headers["x-forwarded-for"];

        let ip="Unknown";

        if(forwardedFor){

            ip=forwardedFor.split(",")[0].trim();

        }

        const record={

            timestamp:new Date(),

            ip,

            userAgent:req.headers["user-agent"],

            eventType:req.body.eventType,

            productId:req.body.productId,

            productName:req.body.productName,

            pageUrl:req.body.pageUrl,

            deviceType:req.body.deviceType,

            screenWidth:req.body.screenWidth,

            screenHeight:req.body.screenHeight,

            location:req.body.location || null

        };

        await collection.insertOne(record);

        return res.status(200).json({
            success:true
        });

    }

    catch(error){

        console.error(error);

        return res.status(500).json({
            success:false,
            message:error.message
        });

    }

}