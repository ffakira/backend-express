function resError (res, err) {
  console.error('[error]:', err)
  res.status(500).json({
    status: 500,
    message: err.message
  })
}

function resNoRows (res) {
  res.status(200).json({
    status: 200,
    data: []
  })
}

module.exports = {
  resError,
  resNoRows
}
