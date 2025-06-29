import mongoose from 'mongoose'


const connectDB = async () => {
    try{
        console.log(process.env.MONGODB_URI)
        const conn = await mongoose.connect(process.env.MONGODB_URI,{
            useNewUrlParser:true,
        });
        console.log(`MongoDb Connected:`)
    } catch(error){
        console.error(error.message);
        process.exit(1);
    }
}

export default connectDB;