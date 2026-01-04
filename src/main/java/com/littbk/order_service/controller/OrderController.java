package com.littbk.order_service.controller;
import java.util.Map;
import com.littbk.order_service.dto.OrderRecordDto;
import com.littbk.order_service.model.Order;
import com.littbk.order_service.model.OrderStatus;
import com.littbk.order_service.repository.OrderRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.time.LocalDateTime;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import com.littbk.order_service.config.KafkaConfig;
import com.littbk.order_service.config.RabbitMqConfig;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@RestController
@RequestMapping("/orders")
@AllArgsConstructor 

public class OrderController {

    private final OrderRepository orderRepository;
    private final RabbitTemplate rabbitTemplate;
    private final KafkaTemplate<String, String> kafkaTemplate;

    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping 
    public ResponseEntity<Order> createOrder(@RequestBody OrderRecordDto orderDto) {
        
        var order = new Order();;

        order.setCustomerName(orderDto.customerName());
        order.setDescription(orderDto.description());
        order.setTotalValue(orderDto.totalValue());

        order.setStatus(OrderStatus.CREATED); 
        order.setOrderTime(LocalDateTime.now()); 

        var orderSaved = orderRepository.save(order);
        

        String mensagem = "Pedido Criado com ID: " + orderSaved.getId();
        rabbitTemplate.convertAndSend(RabbitMqConfig.ORDER_CREATED_QUEUE, mensagem);
        String eventoKafka = "EVENTO_PEDIDO_CRIADO: Cliente=" + orderSaved.getCustomerName() + ", Valor=" + orderSaved.getTotalValue();
        kafkaTemplate.send(KafkaConfig.ORDER_TOPIC, eventoKafka);
        messagingTemplate.convertAndSend("/topic/orders", orderSaved);
        return ResponseEntity.status(HttpStatus.CREATED).body(orderSaved);
    }

    @PutMapping("/{id}/status") 
    public ResponseEntity<Order> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
 
        var order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        // 2. Atualiza o status
        String newStatus = payload.get("status");
        order.setStatus(OrderStatus.valueOf(newStatus));
        var orderUpdated = orderRepository.save(order);

        messagingTemplate.convertAndSend("/topic/orders", orderUpdated);

        return ResponseEntity.ok(orderUpdated);
    }

    @GetMapping
    public ResponseEntity<List<Order>> getOrder() {
       var list = orderRepository.findAll();
        return ResponseEntity.ok(list);
    
    }
        
}