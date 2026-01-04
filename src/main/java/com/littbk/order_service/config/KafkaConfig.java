package com.littbk.order_service.config;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    public static final String ORDER_TOPIC = "order-events";

    @Bean
    public NewTopic orderTopic() {
        // Cria um tópico com 1 partição e 1 réplica (padrão desenvolvimento)
        return TopicBuilder.name(ORDER_TOPIC)
                .partitions(1)
                .replicas(1)
                .build();
    }
}