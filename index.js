// Server creation using http

// const http = require('http');

// const server = http.createServer((req, res)=>{
  //   res.writeHead(200, {
    //     "content-type" : "text/plain"
    //   })
    //   res.end()
    // })
    
    // server.listen(PORT, ()=>{
      //   console.log("server is listening on", PORT)
      // })
      
const PORT = 3000;
const express = require('express');
const authMiddleware = require('./middleware/authMiddleware');
const userRoute = require('./routes/userRoute');
const errorMiddleware = require('./middleware/errorMiddleware');
const { Pool } = require('pg');
require('dotenv').config();


const app = express();

console.log('Connected as user:', process.env.DB_USER);


app.use(express.json());

app.use(authMiddleware);

app.use("/api/users", userRoute);

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: false }));


// Route to handle form submission
app.post('/submit-form', (req, res) => {
  console.log(req.body); // Parsed form data
  const { name, email } = req.body;
  res.send(`Form received! Name: ${name}, Email: ${email}`);
});

// Optional: form for testing in browser
app.get('/', (req, res) => {
  res.send(`
    <form action="/submit-form" method="POST">
      <label>Name:</label><br/>
      <input type="text" name="name"/><br/>
      <label>Email:</label><br/>
      <input type="email" name="email"/><br/>
      <button type="submit">Submit</button>
    </form>
  `);
});

app.use(errorMiddleware);


app.listen(PORT,()=>{
  console.log("Server is running on PORT", PORT)
})