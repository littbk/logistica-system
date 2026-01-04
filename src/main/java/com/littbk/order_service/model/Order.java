package com.littbk.order_service.model;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String customerName; 

    private LocalDateTime orderTime; 

    private LocalDateTime deliveryDeadline; 

    private String pickupAddress;
    
    private String deliveryAddress; 

    private BigDecimal totalValue; 

    @Enumerated(EnumType.STRING) 
    private OrderStatus status;

    private String description; 
}