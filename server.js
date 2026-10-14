const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Cargar credenciales desde Variable de Entorno (Render) o archivo local
let serviceAccount = null;

if (process.env.FIREBASE_CREDENTIALS) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
    } catch (e) {
        console.error('Error al parsear FIREBASE_CREDENTIALS:', e);
    }
} else if (fs.existsSync(path.join(__dirname, 'serviceAccountKey.json'))) {
    serviceAccount = require('./serviceAccountKey.json');
}

if (!serviceAccount) {
    console.error('ERROR CRÍTICO: No se encontraron credenciales válidas de Firebase.');
} else {
    // Inicialización compatible con todas las versiones de firebase-admin
    admin.initializeApp({
        credential: admin.credential ? admin.credential.cert(serviceAccount) : admin.credentialCert(serviceAccount)
    });
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
