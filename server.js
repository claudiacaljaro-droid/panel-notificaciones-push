const express = require('express');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Leer credenciales desde Render (Environment Variable) o desde el archivo local
let serviceAccount;

if (process.env.FIREBASE_CREDENTIALS) {
    serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
} else {
    serviceAccount = require('./serviceAccountKey.json');
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

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
