package com.queuecure.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WaitTimeService {

    private final RedisTemplate<String, String> redisTemplate;

    private static final String REDIS_KEY = "clinic:consult:durations";

    @Value("${clinic.default_consult_minutes:10}")
    private int defaultConsultMinutes;

    public void recordConsultDuration(int durationSeconds) {
        redisTemplate.opsForList().rightPush(REDIS_KEY, String.valueOf(durationSeconds));
        redisTemplate.opsForList().trim(REDIS_KEY, -5, -1); // Keeps only last 5
    }

    public double getRollingAverageMinutes() {
        List<String> durations = redisTemplate.opsForList().range(REDIS_KEY, 0 , -1);

        if (durations == null || durations.isEmpty()) {
            return defaultConsultMinutes;
        }

        double avgSeconds = durations.stream()
                .mapToInt(Integer::parseInt)
                .average()
                .orElse(defaultConsultMinutes * 60.0);

        return avgSeconds / 60.0;
    }

    public double computeWaitMinutes(int position, long totalProcessed, long noShows) {
        double avgMinutes = getRollingAverageMinutes();

        // Raw estimate = position x avg consult duration
        double estimatedWait = position * avgMinutes;

        // Apply no-show discount if rate >= 20%
        if (totalProcessed > 0) {
            double noShowRate = (double) noShows / totalProcessed;
            if (noShowRate >= 0.20) {
                estimatedWait = estimatedWait * (1 - noShowRate);
            }
        }

        return estimatedWait;
    }

    public void clearDurations() {
        redisTemplate.delete(REDIS_KEY);
    }

}
