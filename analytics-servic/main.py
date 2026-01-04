import json
from kafka import KafkaConsumer

# Configuração
TOPIC_NAME = 'order-events'

print("📊 Iniciando Analytics Service...")
print("   Escutando eventos do Kafka em localhost:9092")

# Conecta no Kafka
consumer = KafkaConsumer(
    TOPIC_NAME,
    bootstrap_servers=['localhost:9092'],
    auto_offset_reset='latest',
    group_id='analytics-group',
    value_deserializer=lambda x: x.decode('utf-8') 
)

total_vendido = 0.0

for message in consumer:
    evento = message.value
    
    try:
        if "Valor=" in evento:
            parte_valor = evento.split("Valor=")[1] # Pega tudo depois de Valor=
            valor = float(parte_valor)
            
            total_vendido += valor
            
            print("------------------------------------------------")
            print(f"📈 NOVO EVENTO RECEBIDO: {evento}")
            print(f"💰 Total Acumulado na Sessão: R$ {total_vendido:.2f}")
            print("------------------------------------------------")
            
    except Exception as e:
        print(f"Erro ao processar métrica: {e}")