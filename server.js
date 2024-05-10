const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'citas_jx5j_user',
  host: 'dpg-cotcufv79t8c7395kol0-a.oregon-postgres.render.com',
  database: 'citas_jx5j',
  password: 'jAIup9Zim9zNFg3sJZVSeL2U4ynzbENj',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});
pool.connect((err) => {
  if (err) {
    console.error('Error al conectar a PostgreSQL:', err);
    return;
  }
  console.log('Conexión exitosa a PostgreSQL');
});

// Ruta para crear una nueva cita
app.post('/api/citas', (req, res) => {
  const { nombre, telefono, motivo, fecha, hora } = req.body;

  // Query para insertar una nueva cita
  const query = 'INSERT INTO citas (nombre, telefono, motivo, fecha, hora) VALUES ($1, $2, $3, $4, $5)';
  const values = [nombre, telefono, motivo, fecha, hora];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al crear la cita:', err);
      res.status(500).json({ error: 'Error al crear la cita' });
      return;
    }

    // Enviar una respuesta exitosa
    res.status(200).json({ mensaje: 'Cita creada correctamente' });
  });
});

// Ruta para verificar la disponibilidad de citas en una fecha y hora específicas
app.get('/api/citas/disponibilidad', (req, res) => {
  const { fecha, hora } = req.query;

  const query = 'SELECT * FROM citas';
  const values = [fecha, hora];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al verificar la disponibilidad de citas:', err);
      res.status(500).json({ error: 'Error al verificar la disponibilidad de citas' });
      return;
    }

    // Verificar si hay citas disponibles en la fecha y hora especificadas
    if (result.rows.length > 0) {
      // Hay citas disponibles
      res.status(200).json({ disponible: true });
    } else {
      // No hay citas disponibles
      res.status(200).json({ disponible: false });
      res.status(200).json(result.rows);
    }
  });
});

// Ruta para manejar el inicio de sesión
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Consulta SQL para buscar el usuario en la tabla de usuarios
  const query = 'SELECT * FROM usuarios WHERE nombre_usuario = $1 AND contrasenia = $2';
  const values = [username, password];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al realizar la consulta:', err);
      res.status(500).json({ error: 'Error al iniciar sesión' });
      return;
    }

    // Verificar si se encontró un usuario con las credenciales proporcionadas
    if (result.rows.length === 1) {
      // Usuario autenticado correctamente
      res.status(200).json({ message: 'Inicio de sesión exitoso' });
    } else {
      // Credenciales incorrectas
      res.status(401).json({ error: 'Credenciales incorrectas' });
    }
  });
});

// Ruta para obtener las citas en una fecha específica
app.get('/api/citas/fecha', (req, res) => {
  const { fecha } = req.query;

  // Consulta SQL para obtener las citas filtradas por fecha
  const query = 'SELECT * FROM citas WHERE fecha = $1';
  const values = [fecha];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al obtener las citas:', err);
      res.status(500).json({ error: 'Error al obtener las citas' });
      return;
    }

    // Enviar las citas filtradas como respuesta
    res.status(200).json(result.rows);
  });
});

// Iniciar el servidor
app.listen(3001, () => {
  console.log('Servidor Express corriendo en http://localhost:3001');
});
