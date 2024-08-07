const { Pool } = require('pg');
const express = require('express');

const app = express();
const cors = require('cors');
const redis = require('redis');
const config = require('./config.json');


const publicCorsOptions = {
    origin: "*",
    optionsSuccessStatus: 200,
    credentials: true,
}

app.use(cors(publicCorsOptions));

app.use(express.json());

const postgresPool = new Pool({
    user: config.postgres.user,
    host: config.postgres.host,
    database: config.postgres.database,
    password: config.postgres.password,
    port: config.postgres.port,
    max: config.postgres.max,
});


app.get('/stats', async (req, res) => {

    let postgresClient = null;

    try {

        postgresClient = await postgresPool.connect();

        try {

            let queryString = `
              SELECT *
              FROM fusion_stats
            `;

            const selectResult = await postgresClient.query(queryString);
            res.json({
                data: selectResult.rows
            });

        } catch (e) {
            console.log(e);
            res.status(500)
                .send('Server error');
        }


    } catch (e) {
        console.log(e);
        res.status(500)
            .send('Server error');
    } finally {
        if(postgresClient) {
            postgresClient.release();
        }
    }

});


app.listen(config.express.port, () => {
    console.log(`WaxFusion API is running on ${config.express.port}`)
})