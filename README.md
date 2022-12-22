## Simple API built with express.js

- Built with Postgres
- API endpoints available in the `src/router`

### TODO

- [ ] Add documentation to API
- [ ] Support http2
- [ ] Add e-mail verification
- [ ] Create jest mock functions for unit testing
- [ ] Implement depedency database injection to /user
- [x] Integrate user authentication
- [x] Added user account lock mechanism

### Currently working on

- [ ] Add unit test for /user router
- [ ] Create sqlite memory
- [ ] Create new `column field` for `user_table` for `isLocked` flag

### Configuration file

- `DB_` env variables are for setting up Postgres in `.env`

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

- Currently using husky and prettier to format files
