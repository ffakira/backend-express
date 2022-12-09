const { resError, resNoRows } = require('../utils')

module.exports = (app, client) => {
  app.get('/lyrics', async (_req, res) => {
    const query = 'SELECT * FROM lyric_table'

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

  app.get('/lyric/:id', async (req, res) => {
    const query = 'SELECT * FROM lyric_table WHERE id = $1 LIMIT 1'

    try {
      const resp = await client.query(query, [req.params.id])
      if (resp.rowCount === 0) {
        res.status(204).json({ status: 204, message: 'Lyric ID not found' })
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

  app.post('/lyrics', async (req, res) => {
    const { content, songId } = req.body
    const query = 'INSERT INTO lyric_table (content, song_id) VALUES ($1, $2)'
    const values = [content || null, +songId || null]

    try {
      await client.query(query, values)
      console.log('[console]: new lyric inserted')
      res.status(201).json({
        status: 201,
        data: {
          content,
          songId
        }
      })
    } catch (err) {
      resError(res, err)
    }
  })

  app.patch('/lyric/:id/like', async (req, res) => {
    const queryLyricId = 'SELECT id, likes FROM lyric_table WHERE id = $1'
    const queryUpdate =
      'UPDATE lyric_table SET likes = $2, updated_at = NOW() WHERE id = $1'

    try {
      const respLyricId = await client.query(queryLyricId, [req.params.id])
      if (respLyricId.rowCount === 0) {
        res.status(204).json({ status: 204, message: 'Lyric ID not found' })
      } else {
        const values = [res.params.id, ++respLyricId.rows[0].likes]
        await client.query(queryUpdate, values)
        res.status(200).json({
          status: 200,
          likes: ++respLyricId.rows[0].likes
        })
      }
    } catch (err) {
      resError(res, err)
    }
  })

  app.patch('lyric/:id/dislike', async (req, res) => {
    const queryLyricId = 'SELECT id, likes FROM lyric_table WHERE id = $1'
    const queryUpdate =
      'UPDATE lyric_table SET likes $2, updated_at = NOW() WHERE id = $1'

    try {
      const respLyricId = await client.query(queryLyricId, [req.params.id])
      if (respLyricId.rowCount === 0) {
        res.status(204).json({
          status: 204,
          message: 'Lyric ID not found'
        })
      } else {
        const values = [req.params.id, --respLyricId.rows[0].likes]
        await client.query(queryUpdate, values)
        res.status(200).json({
          status: 200,
          likes: --respLyricId[0].likes
        })
      }
    } catch (err) {
      resError(res, err)
    }
  })

  app.patch('/lyric/:id', async (req, res) => {
    const { likes, content, songId } = req.body
    const queryLyricId = 'SELECT likes, content FROM lyric_table WHERE id = $1'
    const queryUpdateLyric =
      'UPDATE lyric_table SET likes = $2, content = $3, updated_at = NOW() WHERE id = $1'

    try {
      const respLyricId = await client.query(queryLyricId, [req.params.id])
      if (respLyricId.rowCount === 0) {
        res.status(204).json({
          status: 204,
          message: 'Lyric ID not found'
        })
      } else {
        const values = [
          req.params.id,
          likes || queryLyricId.row[0].likes,
          content || queryLyricId[0].content,
          songId || queryLyricId[0].song_id
        ]

        await client.query(queryUpdateLyric, values)
        console.log('[console]: lyrics updated')

        res.status(200).json({
          status: 200,
          data: {
            likes: likes || queryLyricId.row[0].likes,
            content: content || queryLyricId.row[0].content,
            songId: songId || queryLyricId[0].song_id
          }
        })
      }
    } catch (err) {
      resError(res, err)
    }
  })

  app.delete('/lyric/:id', async (req, res) => {
    const queryLyricId = 'SELECT id FROM lyric_table WHERE id = $1'
    const queryDelete = 'DELETE FROM lyric_table WHERE id = $1'

    try {
      const respQueryLyricId = await client.query(queryLyricId, [req.params.id])
      if (respQueryLyricId.rowCount === 0) {
        res.status(204).json({
          status: 204,
          message: 'Lyric ID not found'
        })
      } else {
        await client.query(queryDelete, [req.params.id])
        console.log('[console]: lyric deleted')
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
