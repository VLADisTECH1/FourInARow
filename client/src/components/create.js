import React, { useState } from "react";
import { useNavigate } from "react-router";

// Form key value pairs
export default function Create() {
 const [form, setForm] = useState({
   name: "",
   moves: ""
 });
 const navigate = useNavigate();
 
 // These methods will update the state properties.
 // ... means to unpack {} means to pack
 function updateForm(value) {
   return setForm((prev) => {
     return { ...prev, ...value };
   });
 }
 
 // This function will handle the submission.
 async function onSubmit(e) {
   e.preventDefault();
 
   // When a post request is sent to the create url, we'll add a new record to the database.
   const newPerson = { ...form };
 
   await fetch("http://localhost:5050/record", {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
     },
     //converting form data into JSON format
     body: JSON.stringify(newPerson),
   })
   .catch(error => {
     window.alert(error);
     return;
   });
 
  // After form data has been submitted, it is blanked out.
   setForm({ name: "", moves: "" });
   navigate("/");
 }
 
 // This following section will display the form that takes the input from the user.
 return (
   <div>
     <h3>Create New Record</h3>
     <form onSubmit={onSubmit}>
       <div className="form-group">
         <label htmlFor="name">Name</label>
         <input
           type="text"
           className="form-control"
           id="name"
           value={form.name}
           onChange={(e) => updateForm({ name: e.target.value })}
         />
       </div>
       <div className="form-group">
         <label htmlFor="moves">totalMoves</label>
         <input
           type="text"
           className="form-control"
           id="moves"
           value={form.moves}
           onChange={(e) => updateForm({ moves: e.target.value })}
         />
       </div>
     </form>
   </div>
 );
}