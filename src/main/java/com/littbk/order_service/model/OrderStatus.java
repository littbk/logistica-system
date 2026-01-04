package com.littbk.order_service.model;

public enum OrderStatus {
    CREATED,    // Criado
    PREPARING,  // Na cozinha/Separando
    ON_THE_WAY, // Saiu para entrega
    DELIVERED,  // Entregue
    CANCELED    // Cancelado
}