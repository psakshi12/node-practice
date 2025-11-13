const pool = require('./config/db');
const executeQuery =async()=>{
  await pool.query(
  ` CREATE OR REPLACE FUNCTION get_users()
    RETURNS TABLE(id INT, name VARCHAR, email VARCHAR) AS $$
    BEGIN
    RETURN QUERY SELECT u.id, u.name, u.email FROM users as u;
    END;
    $$ LANGUAGE plpgsql;`
  ) 

  await pool.query(
    `CREATE OR REPLACE FUNCTION create_user(userName VARCHAR, userEmail VARCHAR)
    RETURNS TABLE(id INT, name VARCHAR, email VARCHAR)  AS $$
    BEGIN
      RETURN QUERY
      INSERT INTO users(name, email) VALUES(userName, userEmail) RETURNING *;
    END;
    $$ LANGUAGE plpgsql
    `
  )
}

executeQuery();