// const cron = require('node-cron')
// module.exports=()=>{
//   cron.schedule("* * * * *" ,()=>{
//     console.log("Cron job is running for DB backup");
//   })
// }

const schedule = require('node-schedule');

module.exports=()=>{
  schedule.scheduleJob("* * * * *",()=>{
    console.log("Cron job is running for DB backup using node-schedule");
  })
}