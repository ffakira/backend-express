'use strict'

const { Router } = require('express')
const pool = require('../db')
const { resError, resNoRows } = require('../utils')
const router = Router()

router.get('/all', async (_req, res) => {
  const query = 'SELECT * FROM lyric_table'

  try {
    const resp = await pool.query(query)
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

router.get('/:id', async (req, res) => {
  const query = 'SELECT * FROM lyric_table WHERE id = $1 LIMIT 1'

  try {
    const resp = await pool.query(query, [req.params.id])
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

router.post('/', async (req, res) => {
  const { content, songId } = req.body
  const query = 'INSERT INTO lyric_table (content, song_id) VALUES ($1, $2)'
  const values = [content || null, +songId || null]

  try {
    await pool.query(query, values)
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

router.patch('/:id/like', async (req, res) => {
  const queryLyricId = 'SELECT id, likes FROM lyric_table WHERE id = $1'
  const queryUpdate =
    'UPDATE lyric_table SET likes = $2, updated_at = NOW() WHERE id = $1'

  try {
    const respLyricId = await pool.query(queryLyricId, [req.params.id])
    if (respLyricId.rowCount === 0) {
      res.status(204).json({ status: 204, message: 'Lyric ID not found' })
    } else {
      const values = [res.params.id, ++respLyricId.rows[0].likes]
      await pool.query(queryUpdate, values)
      res.status(200).json({
        status: 200,
        likes: ++respLyricId.rows[0].likes
      })
    }
  } catch (err) {
    resError(res, err)
  }
})

router.patch('/:id/dislike', async (req, res) => {
  const queryLyricId = 'SELECT id, likes FROM lyric_table WHERE id = $1'
  const queryUpdate =
    'UPDATE lyric_table SET likes $2, updated_at = NOW() WHERE id = $1'

  try {
    const respLyricId = await pool.query(queryLyricId, [req.params.id])
    if (respLyricId.rowCount === 0) {
      res.status(204).json({
        status: 204,
        message: 'Lyric ID not found'
      })
    } else {
      const values = [req.params.id, --respLyricId.rows[0].likes]
      await pool.query(queryUpdate, values)
      res.status(200).json({
        status: 200,
        likes: --respLyricId[0].likes
      })
    }
  } catch (err) {
    resError(res, err)
  }
})

router.patch('/:id', async (req, res) => {
  const { likes, content, songId } = req.body
  const queryLyricId = 'SELECT likes, content FROM lyric_table WHERE id = $1'
  const queryUpdateLyric =
    'UPDATE lyric_table SET likes = $2, content = $3, updated_at = NOW() WHERE id = $1'

  try {
    const respLyricId = await pool.query(queryLyricId, [req.params.id])
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

      await pool.query(queryUpdateLyric, values)
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

router.delete('/:id', async (req, res) => {
  const queryLyricId = 'SELECT id FROM lyric_table WHERE id = $1'
  const queryDelete = 'DELETE FROM lyric_table WHERE id = $1'

  try {
    const respQueryLyricId = await pool.query(queryLyricId, [req.params.id])
    if (respQueryLyricId.rowCount === 0) {
      res.status(204).json({
        status: 204,
        message: 'Lyric ID not found'
      })
    } else {
      await pool.query(queryDelete, [req.params.id])
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

module.exports = {
  router,
  name: '/lyric'
}
