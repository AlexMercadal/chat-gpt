exports.findOne = (req, res, next) => {
  // "root" impide salir de la carpeta con ../
  res.sendFile(req.params.file, { root: process.env.PDFS_DIR }, err => {
    if (err) next(err)
  })
}
