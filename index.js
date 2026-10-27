import express from "express";
import { connectDB } from "./connectDB.js";

const app=express();
app.use((req,res,next)=>{
    console.log(new Date().toLocaleString(),req.method ,req.url);
    next();
})


const client= await connectDB();
const db = client.db("sample_mflix");

app.get("/movies/released",async(req,res)=>{
    const movies=db.collection("movies");
    const result = await movies
                    .find({
                        released: {
                            $gte: new Date("2015-01-01"),
                            $lt: new Date("2016-01-01")
                        },
                        genres: "Action",
                        runtime: { $gt: 120 }
                        
                    }).project({
                        title:1,year:1,runtime:1,genres:1,released:1
                    })
                    .toArray();

    res.status(200).json({
        data:result,
    })
});


app.get("/movies/directed",async(req,res)=>{
    const movies=db.collection("movies");

    const result = await movies.find({
     directors: "Christopher Nolan" 
    }).project({
        title:1,
        year:1,
        runtime:1,
        directors:1,
        _id:0
    }).sort({
        year:-1
    }).toArray()

    res.status(200).json({
        data : result
    })
})

app.get("/movies",async(req,res)=>{
    const movies=db.collection("movies");

    const data=await movies.insertOne({
        title:"F1",
        year:2026,
        runtime:150,
        rated: "PG-13",
        type:"movie",
         genres: ["Action", "Drama"],
         num_mflix_comments: 0
    })

    res.status(201).json({
        message:"Movies Add Successfull!",
        data:data,
    })
});

app.get("/movies/Popular",async(req,res)=>{
    const movies = db.collection("movies");

    const data=await movies.updateMany(
   {
        year:2014,
        num_mflix_comments: { $gt: 5}
    },
    {
        $set:{
            isPopular:true
        }, 
        $inc:{
            num_mflix_comments: 1
        }
    }
)

    res.status(200).json({
        message:"Movies Update Successfull!",
        data:data
    })
})

app.get("/movies/old", async (req, res) => {
    
        const movies = db.collection("movies");

        const result = await movies.deleteMany({
            year: { $lt: 1920 },
            runtime: { $lt: 30 }
        });

        res.status(200).json({
            message: "Movies deleted successfully!",
            deletedCount: result.deletedCount
        });
});



app.get("/movies/stats", async (req, res) => {
    
        const movies = db.collection("movies");

        const result = await movies.aggregate([
            {
                $match: {
                    year: { $gte: 2010 }
                }
            },
            {
                $group: {
                    _id: "$year",
                    totalMovies: { $sum: 1 },
                    averageRuntime: { $avg: "$runtime" }
                }
            },
            {
                $sort: {
                    _id: -1
                }
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id",
                    totalMovies: 1,
                    averageRuntime: 1
                }
            }
        ]).toArray();

        res.status(200).json({
            data: result
        });
    
});


app.use((err,req,res,next)=>{
    console.log(err);
    res.status(500).json({ error: "something went wrong" });
})

app.listen(3000,()=>{
    console.log("Server on Port : 3000");
})