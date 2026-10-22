const crypto = require('crypto');

module.exports = async (req, res) => {
    // Дозволяємо запити з твого сайту (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        const { amount, order_id } = req.body;

        // ТУТ БУДУТЬ ТВОЇ КЛЮЧІ (ми додамо їх у налаштуваннях Vercel)
        const public_key = process.env.LIQPAY_PUBLIC_KEY;
        const private_key = process.env.LIQPAY_PRIVATE_KEY;

        const params = {
            action: 'pay',
            amount: amount,
            currency: 'UAH',
            description: 'Поповнення балансу FULLDROP',
            order_id: order_id,
            version: '3',
            public_key: public_key,
            result_url: 'https://твій-сайт.com' // Куди повернеться гравець після оплати
        };

        // Генерація підпису (signature)
        const data = Buffer.from(JSON.stringify(params)).toString('base64');
        const signature = crypto.createHash('sha1')
            .update(private_key + data + private_key)
            .digest('base64');

        res.status(200).json({ data, signature });
    } catch (error) {
        res.status(500).json({ error: 'Помилка створення платежу' });
    }
};
