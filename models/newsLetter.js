const mongoose = require("mongoose");
const validator = require("validator");

 const userSchema = mongoose.Schema({
     
     email: {
         type: String,
         required: true,
         validate(value){
             if(!validator.isEmail(value)){
                 throw new Error("Invalid Email Id") 
             }
         }
     }
 });


 //we need a collection

 const sub = mongoose.model("Subscribers",userSchema);

 module.exports = sub;