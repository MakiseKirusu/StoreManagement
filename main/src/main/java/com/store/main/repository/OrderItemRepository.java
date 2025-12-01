package com.store.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.store.main.model.OrderItem;
//Repository to manage OrderItem entities
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {}
