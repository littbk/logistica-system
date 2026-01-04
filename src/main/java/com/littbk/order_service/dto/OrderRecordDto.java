package com.littbk.order_service.dto;

import java.math.BigDecimal;

public record OrderRecordDto(String customerName, String description, BigDecimal totalValue) {
}