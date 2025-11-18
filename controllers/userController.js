const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const pool = require('../config/db')

const getAllUser=async(req, res, next)=>{
  try {
    const limit = req.query.limit;
    const page = req.query.page;
    const searchQuery = req.query.search;
    const sortBy = req.query.sort_by;
    const sortOrder = req.query.sort_order;
    const offset = (page -1)*limit;

    //Using stored function
    // const result = await pool.query(
    //   'SELECT * FROM get_users()',
    // ) 

    // With Pagination
    const userQuery = 'SELECT * FROM get_users($1, $2, $3, $4, $5)'
    const countQuery = `SELECT * from get_total_count()`
    const [userResult, countResult] = await Promise.all(
      [
        pool.query(userQuery, [limit, offset, searchQuery, sortBy, sortOrder]),
        pool.query(countQuery)
      ]
    )

    const totalItems = countResult.rows[0].get_total_count;
    const totalPages = Math.ceil(totalItems/limit) ;

    res.status(200).json({
      status: "success",
      totalPages,
      totalItems,
      currentPage: page,
      data: userResult.rows,
    })
  }catch(err) {
    console.log(err, "err")
    next(err)
  }
}

const getUserById=async(req, res, next)=>{
  const {id} = req.params;
  try {
    if(!id) throw new AppError('User id is missing', 400);

    //Using stored function
    const result = await pool.query(
      'SELECT * FROM get_user_by_id($1)',[id]
    ) 
    if(result.rows?.length) {
      res.status(200).json({
        status: "success",
        data: result.rows[0]
      })
    }else {
      throw new AppError('User does not exist', 404);
    }
  }catch(err) {
    next(err)
  }
}

const addUser=catchAsync(async(req, res)=>{
  const {name, email} = req.body;
  if(!name || !email) {
    throw new AppError("Required fields are missing", 400);
  }

  // const result = await pool.query(
  //   'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
  //   [name, email]
  // )

  //Using stored function
  const result = await pool.query(
    'SELECT * FROM create_user($1, $2)', [name, email]
  )
    
  res.status(201).json(result.rows[0])
})

const updatedUser = catchAsync(async(req, res)=> {
  const {id} = req.params;
  const {name, email} = req.body;
  if(!name || !email) throw new AppError("Required fields are missing", 400);

  // const result = await pool.query(
  //   'UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING *', [name, email, id]
  // )

   const result = await pool.query(
    'SELECT * FROM update_user($1, $2, $3)', [id, name, email]
  )

  if(!result.rows.length) {
    throw new AppError("User not found", 404)
  }else { 
    res.status(200).json({
      status : true,
      message : "User updated successfully",
      data: result.rows
    })
  }
})

const deleteUser=catchAsync(async(req, res)=>{
  const {id} = req.params;
  if(!id) throw new AppError("User id is missing", 400);
  // const result = await pool.query(
  // 'DELETE from users WHERE id=$1 RETURNING *', [id]
  // )

   //Using stored function
   const result = await pool.query(
    `SELECT * from delete_user($1)`, [id]
  )
  if(result.rowCount === 0) throw new AppError("User does not exist", 404);
  res.json({ message: 'User deleted successfully' });
})

module.exports = {getAllUser, addUser, updatedUser, deleteUser, getUserById};