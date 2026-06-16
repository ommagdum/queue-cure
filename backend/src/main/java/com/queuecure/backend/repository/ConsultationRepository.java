package com.queuecure.backend.repository;

import com.queuecure.backend.model.ConsultationLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ConsultationRepository extends JpaRepository<ConsultationLog, UUID> {

}
