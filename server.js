const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Cargar credenciales desde el archivo secreto de Render o local
const keyPath = path.join(__dirname, 'serviceAccountKey.json');

if (fs.existsSync(keyPath)) {
    const serviceAccount = require(keyPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin inicializado correctamente.");
} else {
    console.error("ERROR: No se encontró el archivo serviceAccountKey.json");
}

// Endpoint de envío de notificaciones
app.post('/send-notification', async (req, res) => {
    const { token, title, body } = req.body;

    if (!token || !title || !body) {
        return res.status(400).json({ success: false, error: 'Faltan campos requeridos.' });
    }

    const message = {
        token: token,
        notification: { title, body },
        data: { title, body }
    };

    try {
        const response = await admin.messaging().send(message);
        res.json({ success: true, messageId: response });
    } catch (error) {
        console.error('Error al enviar la notificación:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor activo en el puerto ${PORT}`);
});
