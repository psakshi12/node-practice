const pool = require('./config/db');
const executeQuery =async()=>{
  // queery for getting user list
  await pool.query(
  ` CREATE OR REPLACE FUNCTION public.get_users(
    _limit integer,
    _offset integer,
    _searchQuery text,
    _sortBy TEXT DEFAULT 'id',
    _sortOrder TEXT DEFAULT 'asc'
)
RETURNS TABLE(id integer, name character varying, email character varying)
LANGUAGE plpgsql
AS $BODY$
DECLARE
    sql TEXT;
BEGIN
    -- Validate sort order
    IF LOWER(_sortOrder) NOT IN ('asc', 'desc') THEN
        _sortOrder := 'asc';
    END IF;

    -- Validate sortBy column
    IF LOWER(_sortBy) NOT IN ('id', 'name', 'email') THEN
        _sortBy := 'id';
    END IF;

    -- Build dynamic SQL query
    sql := '
        SELECT id, name, email
        FROM users
        WHERE ($1 IS NULL OR $1 = ''''
            OR name ILIKE ''%'' || $1 || ''%''
            OR email ILIKE ''%'' || $1 || ''%'')
        ORDER BY ' || _sortBy || ' ' || _sortOrder || '
        LIMIT ' || _limit || ' OFFSET ' || _offset;

    -- Execute dynamic SQL safely
    RETURN QUERY EXECUTE sql USING _searchQuery;
END;
$BODY$;
`
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