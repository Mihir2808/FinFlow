package com.finflow.payment.domain.payment;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository {
    Optional<Payment> findById(UUID id);
    Optional<Payment> findByIdempotencyKey(String idempotencyKey);
    List<Payment> findByPayerId(UUID payerId);
    Payment save(Payment payment);
}
