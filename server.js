const { sessions } = require('./pair');

app.get('/api/session/:id', (req, res) => {
  const id = req.params.id;

  if (sessions[id]) {
    return res.json({
      status: 'active'
    });
  }

  return res.json({
    status: 'inactive'
  });
});
