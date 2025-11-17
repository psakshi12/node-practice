const pool = require('./config/db');
const executeQuery =async()=>{
  // queery for getting user list
  await pool.query(
  ` CREATE OR REPLACE FUNCTION get_users()
    RETURNS TABLE(id INT, name VARCHAR, email VARCHAR) AS $$
    BEGIN
    RETURN QUERY SELECT u.id, u.name, u.email FROM users as u;
    END;
    $$ LANGUAGE plpgsql;`
  ) 

  // query for creating user
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

  // query for getting user by ID
  await pool.query(
    `CREATE OR REPLACE FUNCTION get_user_by_id(userId INT)
    RETURNS TABLE(id INT, name VARCHAR, email VARCHAR) AS $$
    BEGIN
      RETURN QUERY
      SELECT * from users as u WHERE u.id=userId;
    END;
    $$
    LANGUAGE plpgsql
    `
  )

  //query to delete the user
  await pool.query(
    `CREATE OR REPLACE FUNCTION delete_user(userId INT)
      RETURNS TABLE(id INT, name VARCHAR, email VARCHAR)
      LANGUAGE plpgsql AS $$
      BEGIN
        RETURN QUERY
        DELETE from users WHERE users.id = userId RETURNING *;
      END;
      $$
    `
  )

  // update the user
  await pool.query(
    `CREATE OR REPLACE FUNCTION update_user(userId INT, userName VARCHAR, userEmail VARCHAR)
      RETURNS TABLE(id INT, name VARCHAR, email VARCHAR)
      LANGUAGE plpgsql AS $$
        BEGIN
          RETURN QUERY
          UPDATE users SET name=userName, email=userEmail WHERE users.id=userId RETURNING *;
        END;
      $$
    `
  )
}

executeQuery();