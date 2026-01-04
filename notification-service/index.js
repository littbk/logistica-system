const amqplib = require('amqplib');

async function connect() {
    try {
        const connection = await amqplib.connect('amqp://guest:guest@localhost:5672');
        
        console.log("✅ Conectado ao RabbitMQ!");

        connection.on('error', (err) => {
            console.error('Connection error:', err);
        });

        const channel = await connection.createChannel(); 
        const queueName = 'orders.v1.created'; 

        await channel.assertQueue(queueName, { durable: true });
        
        console.log(` [*] Aguardando mensagens na fila: ${queueName}`);

        channel.consume(queueName, (msg) => {
            if (msg !== null) {
                const conteudo = msg.content.toString();
                
                console.log(` [x] Recebido do Java: '${conteudo}'`);
                console.log(` [x] Enviando notificação para o cozinheiro...`);

                channel.ack(msg); 
            }
        });

    } catch (error) {
        console.error('Erro ao conectar:', error);
    }
}

// 4. Executar a função
connect();