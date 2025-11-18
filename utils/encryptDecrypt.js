const bcrypt = require('bcrypt');

const   bcryptPassword=(password)=>{
  const salt = bcrypt.genSaltSync(JSON.parse(process.env.SALT_ROUNDS));
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

const comparePassword = (password, hashPassword)=>{
  const match = bcrypt.compareSync(password, hashPassword);
  return match;
}

module.exports = {
  bcryptPassword,
  comparePassword
}