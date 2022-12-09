const { resError, resNoRows } = require('../utils')

module.exports = (app, client) => {
  app.get('/songs', async (_req, res) => {
    const query = 'SELECT * FROM song_table'

    try {
      const resp = await client.query(query)
      if (resp.rowCount === 0) {
        resNoRows(res)
      } else {
        res.status(200).json({
          status: 200,
          data: resp.rows
        })
      }
    } catch (err) {
      resError(res, err)
    }
  })

  app.get('/song/:id', async (req, res) => {
    const query = 'SELECT * FROM song_table WHERE id = $1 LIMIT 1'

    try {
      const resp = await client.query(query, [req.params.id])
      if (resp.rowCount === 0) {
        res.status(204).json({ status: 204, message: 'Song ID not found' })
      } else {
        res.status(200).json({
          status: 200,
          data: resp.rows[0]
        })
      }
    } catch (err) {
      resError(res, err)
    }
  })

  app.post('/songs', async (req, res) => {
    const { title, userId, lyricId } = req.body
    const query = 'INSERT INTO song_table (title, user_id, lyric_id) VALUES ($1, $2, $3)'
    const values = [title || null, +userId || null, +lyricId || null]

    try {
      await client.query(query, values)
      console.log('[console]: new song inserted')
      res.status(201).json({
        status: 201,
        data: {
          title,
          userId,
          lyricId
        }
      })
    } catch (err) {
      resError(res, err)
    }
  })

  app.patch('/song/:id', async (req, res) => {
    const { title, userId, lyricId } = req.body
    const querySongId = 'SELECT id, title, user_id, lyric_id FROM song_table WHERE id = $1'
    const queryUpdateSong = 'UPDATE song_table SET title = $2, user_id = $3, lyric_id = $4, updated_at = NOW() WHERE id = $1'

    try {
      const respSongId = await client.query(querySongId, [req.params.id])
      if (respSongId.rowCount === 0) {
        res.status(204).json({ status: 204, message: 'Song ID not found' })
      } else {
        const values = [
          req.params.id,
          title || respSongId.rows[0].title,
          userId || respSongId.rows[0].user_id,
          lyricId || respSongId.rows[0].lyric_id
        ]

        await client.query(queryUpdateSong, values)
        console.log('[console]: song updated')

        res.status(200).json({
          status: 200,
          data: {
            title: title || respSongId.rows[0].title,
            userId: userId || respSongId.rows[0].user_id,
            lyricId: lyricId || respSongId.rows[0].lyric_id

          }
        })
      }
    } catch (err) {
      resError(res, err)
    }
  })

  app.delete('/song/:id', async (req, res) => {
    const querySongId = 'SELECT id FROM song_table WHERE id = $1'
    const queryDelete = 'DELETE FROM song_table WHERE id = $1'

    try {
      const respSongId = await client.query(querySongId, [req.params.id])
      if (respSongId.rowCount === 0) {
        res.status(204).json({
          status: 204,
          message: 'Song not found'
        })
      } else {
        await client.query(queryDelete, [req.params.id])
        console.log('[console]: song deleted')
        res.status(200).json({
          status: 200,
          data: {
            id: req.params.id
          }
        })
      }
    } catch (err) {
      resError(res, err)
    }
  })
}
