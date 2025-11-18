const pool = require('./config/db');
const executeQuery =async()=>{
  // query for getting user list
  await pool.query(
  ` CREATE OR REPLACE FUNCTION get_users(_limit INT, _offset INT, _searchQuery TEXT, sortBy TEXT DEFAULT 'id', sortOrder TEXT DEFAULT 'asc')
    RETURNS TABLE(id INT, name VARCHAR, email VARCHAR) 
    LANGUAGE plpgsql
    AS $body$
    
    DECLARE
      sql TEXT;

    BEGIN 
    --Validate Sort order
    IF LOWER(sortOrder) NOT IN ('asc', 'desc') THEN
      sortOrder := 'asc';
    END IF;

    --Validate sort By
    IF LOWER(sortBy) NOT IN ('id', 'name', 'email') THEN
      sortBy := 'id';
    END IF;

    sql := 
    'SELECT u.id, u.name, u.email FROM users as u '
      'WHERE (
      $1 IS NULL OR $1='''' OR
      u.name ILIKE ''%'' || $1 || ''%'' OR
      u.email ILIKE ''%'' || $1 || ''%''
      )'
    'ORDER BY ' || sortBy || ' ' || sortOrder || ' ' ||
    'LIMIT ' || _limit || ' ' || 'OFFSET ' || _offset;

    RETURN QUERY EXECUTE sql USING _searchQuery;
     
    END;
    $body$`
  ) 

  await pool.query(
    `
    CREATE OR REPLACE FUNCTION get_total_count()
    RETURNS INT
    LANGUAGE plpgsql AS $$
    DECLARE
      totalCount INT;
    BEGIN
      SELECT COUNT(*) INTO totalCount from users;
      RETURN totalCount;
    END;
    $$
    `
  )

  //query for getting user by email

  await pool.query(
    `CREATE OR REPLACE FUNCTION get_user_by_email(userEmail VARCHAR)
      RETURNS TABLE(id INT, name VARCHAR, email VARCHAR, password TEXT)
      AS $$

      BEGIN
        RETURN QUERY
        SELECT * from users as u WHERE u.email=userEmail;
      END;
      $$ LANGUAGE plpgsql;
    `
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

    // query for creating new user
  await pool.query(
    `CREATE OR REPLACE FUNCTION create_new_user(userName VARCHAR, userEmail VARCHAR, userPassword TEXT)
    RETURNS TABLE(id INT, name VARCHAR, email VARCHAR, password TEXT)  AS $$
    BEGIN
      RETURN QUERY
      INSERT INTO users(name, email, password) VALUES(userName, userEmail, userPassword) RETURNING *;
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