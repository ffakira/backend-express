## Simple GraphQL express.js

- Built with Postgres
- Schemas available at `schema`

### TODO

- Add documentation
- Create new API endpoints
- Add caching stategy with redis
- Integrate user authentication


### Configuration file

* `DB_` env variables are for setting up Postgres in `.env`

```sh
NODE_ENV=development
PORT=4000
DB_NAME=
DB_USERNAME=
DB_PASSWORD=
DB_PORT=5432
DB_HOST=localhost
```

Migration file config file `database.json`, all migrations available at `migrations` folder

```json
{
  "dev": {
    "driver": "pg",
    "user": "<username>",
    "password": "<password>",
    "host": "localhost",
    "database": "<database_name>",
    "port": "5432"
  }
}
```

### Pre-commit hooks
* Currently using husky and prettier to format files
