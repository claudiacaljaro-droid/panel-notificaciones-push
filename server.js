const express = require('express');
const cors = require('cors');
const { initializeApp, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

// Cargar las credenciales privadas descargadas de Firebase
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin usando la importación modular correcta
initializeApp({
  credential: cert(serviceAccount)
});

const app = express();

// ✅ Usar el puerto asignado por Render o 3000 en local
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors()); // Permite conectar el HTML local con el servidor

// ✅ Servir archivos estáticos (index.html, etc.) desde el directorio raíz
app.use(express.static(__dirname));

// Endpoint para recibir la petición del formulario web y enviar la notificación
app.post('/send-notification', async (req, res) => {
  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).send({ success: false, error: 'Faltan parámetros (token, title, body)' });
  }

  const message = {
    token: token,
    notification: {
      title: title,
      body: body
    }
  };

  try {
    const response = await getMessaging().send(message);
    console.log('Notificación enviada correctamente:', response);
    res.status(200).send({ success: true, messageId: response });
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});

// ✅ Escuchar en el puerto dinámico asignado por Render
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});