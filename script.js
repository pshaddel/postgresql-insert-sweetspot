const pg = require('pg');
const main = async () => {
    const client = new pg.Client({
        user: 'user',
        host: 'localhost',
        database: 'db',
        password: 'pass',
        port: 5432,
    });

    await client.connect();
    await createTable(client);

    const length = 0.3 * 1000; // 100k

    const data = getDummyData(length);

    /** insert all records together by passing all of them in values */
    const query = `INSERT INTO users (email, age) VALUES ${data.map((value, i) => `('${value.email}', ${value.age})`).join(', ')};`;
    // console.log(query);

    /** insert records by passing a string that contains insert for each phrase */
    // const query = data.map(({ email, age }) => `INSERT INTO users (email, age) VALUES ('${email}', ${age});`).join(' ');

    const start = new Date();
    await client .query(query);
    const end = new Date();
    console.log(`Inserting ${length} records took ${end - start} ms`);
    await client.end();

    const numeberOfRecordsInsertedPerSecond = length / ((end - start) / 1000);

    console.log(`Number of records inserted per second: ${numeberOfRecordsInsertedPerSecond.toFixed(1)}`);
};

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });

/**
 * Create a Table with fields: id, email, age, created_at, updated_at
 * and set id as primary key
 * and use index for email
 */
const createTable = async (client) => {
    await client.query(`DROP TABLE IF EXISTS users;`);
    await client.query(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            age INT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
    `);
    await client.query(`CREATE INDEX users_email_index ON users(email);`);
}


/**
 * Get dummy data
 */
const getDummyData = (length) => {
    const data = [];
    for (let i = 0; i < length; i++) {
        data.push({
            email: `${i}@gmail.com`,
            age: i,
        });
    }

    return data;

}