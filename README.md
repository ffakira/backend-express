## Simple GraphQL express.js

- Built with Postgres
- Schemas available at `schema`

### TODO

- Add documentation
- Create new API endpoints
- Add caching stategy with redis
- Integrate user authentication


### Env file

* `DB_` env variables are for setting up Postgresq, please note that currently only supports Postgres as I am using `pg` library instead of `sequelize`

In the future, I will integrate a database migration file, along with `sequelize` library.

```sh
NODE_ENV=development
PORT=4000
DB_NAME=
DB_USERNAME=
DB_PASSWORD=
DB_PORT=5432
DB_HOST=localhost
```

### Pre-commit hooks
* Currently using husky and prettier to format files
