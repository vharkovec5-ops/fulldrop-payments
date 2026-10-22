const crypto = require('crypto');
const admin = require('firebase-admin');

// Ініціалізація Firebase Admin (потребує сервісного акаунта)
// if (!admin.apps.length) {
//     admin.initializeApp({
//         credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
//     });
// }

module.exports = async (req, res) => {
    try {
        const { data, signature } = req.body;
        const private_key = process.env.LIQPAY_PRIVATE_KEY;

        // Перевірка підпису, щоб ніхто не міг підробити оплату
        const expectedSignature = crypto.createHash('sha1')
            .update(private_key + data + private_key)
            .digest('base64');

        if (signature !== expectedSignature) {
            return res.status(400).send('Invalid signature');
        }

        // Розшифровка даних
        const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));

        if (decodedData.status === 'success' || decodedData.status === 'sandbox') {
            const order_id = decodedData.order_id; // Тут має бути UID гравця
            const amount = decodedData.amount;

            // ТУТ ТИ ПИШЕШ КОД НАРАХУВАННЯ МОНЕТ У FIREBASE
            // Наприклад:
            // await admin.database().ref('users/' + order_id + '/balance').transaction(bal => (bal || 0) + amount);

            console.log(`✅ Оплата успішна! Гравець: ${order_id}, Сума: ${amount}`);
        }

        res.status(200).send('OK');
    } catch (error) {
        res.status(500).send('Error');
    }
};
